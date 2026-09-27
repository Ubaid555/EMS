import mongoose from "mongoose";
import env from "./env.config.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);
    console.log(
      `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`,
    );

    // Ensure legacy email unique index is dropped if present
    try {
      await connection.connection.collection("employees").dropIndex("credentials.email_1");
    } catch {
      // Ignored if index doesn't exist
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    throw error;
  }
};

export default connectDB;
