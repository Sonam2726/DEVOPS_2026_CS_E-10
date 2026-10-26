const mongoose = require("mongoose");

const sanitizeErrorMessage = (error, mongoUri) => {
  const message = typeof error?.message === "string" ? error.message : "Unknown error";

  return message
    .split(mongoUri)
    .join("[MongoDB URI redacted]")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[MongoDB URI redacted]");
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillbridge";

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully!");
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", sanitizeErrorMessage(error, mongoUri));
    });
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", sanitizeErrorMessage(error, mongoUri));
    return false;
  }
};

module.exports = connectDB;