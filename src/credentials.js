require("dotenv").config();
const { authorize } = require("./common");

authorize().catch(console.error);
