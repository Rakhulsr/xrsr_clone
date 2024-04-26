import mongoose from "mongoose";
import "dotenv/config";

const DB_URI = process.env.DB_URI;

const connectMongoDB = async () => {
  try {
    const connectDB = await mongoose.connect(DB_URI);
    console.log(`DB connected : ${connectDB.connection.host}`);
  } catch (error) {
    console.error(`error connecting to db: ${error.message}`);

    process.exit(1);
  }
};

export default connectMongoDB;
