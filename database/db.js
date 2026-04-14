const mongoose = require("mongoose");
const dns = require('dns');
dns.setServers(['8.8.8.8','8.8.4.4']);
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("connected to database successfully");
  } catch (error) {
    console.log("Unable to connect to database:", error);
     process.exit(1); // stop the server
  }
}

module.exports = connectToDatabase;
