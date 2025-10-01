const app = require("./app");
const axios = require("axios");
const PORT = process.env.PORT || 4001;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}\n`);

  const BASE_URL = `http://localhost:${PORT}`;
  const API_BASE = `${BASE_URL}/api/gustav-albrecht-apitest`;

  try {
    console.log("Blockchain connection Check");
    console.log(`route: ${API_BASE}/connection\n`);

    const connectionResponse = await axios.get(`${API_BASE}/connection`);
    console.log(JSON.stringify(connectionResponse.data, null, 0));
    console.log("\n");

    console.log("contracts");
    console.log(`route: ${API_BASE}/contracts\n`);

    const response = await axios.get(`${API_BASE}/contracts`);
    contractsResponse = response.data;
    console.log(JSON.stringify(contractsResponse.data.blockchain, null, 0));
    console.log("\n");
    console.log("contract: dETH");
    console.log(JSON.stringify(contractsResponse.data.dETH, null, 0));
    console.log("\n");
    console.log("contract: sETH");
    console.log(JSON.stringify(contractsResponse.data.sETH, null, 0));
    console.log("\n");
    console.log("contract: governance");
    console.log(JSON.stringify(contractsResponse.data.governance, null, 0));
    console.log("\n");
    console.log("contract: stakingDashboard");
    console.log(
      JSON.stringify(contractsResponse.data.stakingDashboard, null, 0)
    );
    console.log("\n");
    console.log("ALL CONTRACTS FETCHED SUCCESSFULLY!");
  } catch (error) {
    console.error("Demo error:", error.message);
  }
});
