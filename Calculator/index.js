const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 9876;

const TEST_SERVER_URL = "https://test-server.com/api/numbers"; // Replace with actual test server URL


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
