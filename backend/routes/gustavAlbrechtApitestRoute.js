const express = require("express");
const {
  getSmartContractInfo,
  connectionCheck,
} = require("../controllers/gustavAlbrechtApitestController");

const router = express.Router();

router.route("/contracts").get(getSmartContractInfo);
router.route("/connection").get(connectionCheck);

module.exports = router;
