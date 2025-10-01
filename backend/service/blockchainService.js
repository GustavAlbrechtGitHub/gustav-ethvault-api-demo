const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const ErrorHandler = require("../utils/errorHandler");

class BlockchainService {
  constructor() {
    // const rpcUrl = "https://ethereum-holesky-rpc.publicnode.com";
    const rpcUrl = "https://holesky.rpc.thirdweb.com";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contracts = {};
    this.abis = {};
  }

  loadABI(contractName) {
    if (this.abis[contractName]) {
      return this.abis[contractName];
    }
    try {
      const abiPath = path.join(
        __dirname,
        "..",
        "..",
        "lib",
        "abis",
        `${contractName}.json`
      );
      if (!fs.existsSync(abiPath)) {
        throw new ErrorHandler(`ABI file not found: ${abiPath}`, 404);
      }
      const abiData = fs.readFileSync(abiPath, "utf8");
      this.abis[contractName] = JSON.parse(abiData);

      return this.abis[contractName];
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(
        `Failed to load ${contractName} ABI: ${error.message}`,
        500
      );
    }
  }

  getContract(contractName, address) {
    const key = `${contractName}_${address}`;

    if (this.contracts[key]) {
      return this.contracts[key];
    }

    const abi = this.loadABI(contractName);
    this.contracts[key] = new ethers.Contract(address, abi, this.provider);

    return this.contracts[key];
  }

  getContractWithSigner(contractName, address, signer) {
    const abi = this.loadABI(contractName);
    return new ethers.Contract(address, abi, signer);
  }

  getProvider() {
    return this.provider;
  }
}

module.exports = new BlockchainService();
