const mongoose = require("mongoose");
const color = require("colors");

const connectDb = async () => {
  console.log("Started connecting!!");
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});

    console.log(`MongoDb Connected ${conn.connection.host}`.yellow.bold);
  } catch (e) {
    console.log(`MongoDb Connect Error ${e.message}`.red.bold);
    process.exit();
  }
};

module.exports = connectDb;
