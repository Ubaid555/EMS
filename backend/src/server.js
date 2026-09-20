import env from "./config/env.config.js";
import connectDb from "./config/connectDB.js";
import app from "./app.js";
import { refreshLookupCache } from "./services/lookup.service.js";

const startServer = async () => {
  try {
    await connectDb();
    await refreshLookupCache();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on PORT ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
