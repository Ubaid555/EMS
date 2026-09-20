import mongoose from "mongoose";
import env from "./env.config.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);
    console.log(
      `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`,
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    throw error;
  }
};

export default connectDB;
