const { ethers } = require("ethers");
const blockchainService = require("../service/blockchainService");
const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");

const CONTRACTS = {
  DETH: "0x520d7dAB4A5bCE6ceA323470dbffCea14b78253a",
  SETH: "0x16b0cD88e546a90DbE380A63EbfcB487A9A05D8e",
  GOVERNANCE: "0xD396FE92075716598FAC875D12E708622339FA3e",
  STAKING_DASHBOARD: "0xd33e9676463597AfFF5bB829796836631F4e2f1f",
};

const safeCall = async (contract, method, defaultValue = "N/A") => {
  try {
    return await contract[method]();
  } catch (error) {
    console.error(`Error calling ${method}:`, error.message);
    return defaultValue;
  }
};

const formatValue = (value, isEther = false) => {
  if (typeof value === "string") return value;
  return isEther ? ethers.formatEther(value) : value.toString();
};

exports.getSmartContractInfo = asyncErrorHandler(async (req, res, next) => {
  try {
    const dETH = blockchainService.getContract("dETH", CONTRACTS.DETH);
    const sETH = blockchainService.getContract("sETH", CONTRACTS.SETH);
    const governance = blockchainService.getContract(
      "governance",
      CONTRACTS.GOVERNANCE
    );
    const staking = blockchainService.getContract(
      "stakingDashboard",
      CONTRACTS.STAKING_DASHBOARD
    );

    const provider = blockchainService.getProvider();
    const [blockNumber, network] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
    ]);

    const [
      dETHName,
      dETHTotalSupply,
      dETHBalance,
      sETHName,
      sETHTotalSupply,
      proposalCount,
      quorum,
      stakingOverview,
    ] = await Promise.all([
      safeCall(dETH, "name", "dETH"),
      safeCall(dETH, "totalSupply", "0"),
      safeCall(dETH, "getContractETHBalance", "0"),
      safeCall(sETH, "name", "sETH"),
      safeCall(sETH, "totalSupply", "0"),
      safeCall(governance, "proposalCount", "0"),
      safeCall(governance, "quorum", "0"),
      safeCall(staking, "getStakingOverview", null),
    ]);

    const contractsData = {
      blockchain: {
        network: "Holesky Testnet",
        chainId: Number(network.chainId),
        currentBlock: blockNumber,
      },
      dETH: {
        address: CONTRACTS.DETH,
        name: dETHName,
        totalSupply: formatValue(dETHTotalSupply, true),
        contractBalance: formatValue(dETHBalance, true),
      },
      sETH: {
        address: CONTRACTS.SETH,
        name: sETHName,
        totalSupply: formatValue(sETHTotalSupply, true),
      },
      governance: {
        address: CONTRACTS.GOVERNANCE,
        proposalCount: formatValue(proposalCount),
        quorum: formatValue(quorum, true),
      },
      stakingDashboard: {
        address: CONTRACTS.STAKING_DASHBOARD,
        totalStaked: stakingOverview
          ? formatValue(stakingOverview.totalETHStaked, true)
          : "0",
        totalStakers: stakingOverview
          ? formatValue(stakingOverview.totalStakers)
          : "0",
      },
    };

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Smart contract data retrieved successfully",
      totalContracts: 4,
      data: contractsData,
    });
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.connectionCheck = asyncErrorHandler(async (req, res, next) => {
  try {
    const provider = blockchainService.getProvider();
    const [blockNumber, network] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
    ]);

    res.status(200).json({
      success: true,
      message: "API connected to holesky blockchain successfully.",
      timestamp: new Date().toISOString(),
      blockchain: {
        connected: true,
        currentBlock: blockNumber,
        network: "Holesky Testnet",
        chainId: Number(network.chainId),
      },
    });
  } catch (error) {
    console.error("Connection check failed:", error);
    return next(
      new ErrorHandler(
        "Connection unhealthy - blockchain connection failed",
        503
      )
    );
  }
});
