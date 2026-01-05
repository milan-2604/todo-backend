const mongoose = require("mongoose");

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
