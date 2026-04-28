import mongoose from "mongoose";

const connectOptions = {
  serverSelectionTimeoutMS: 5000,
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = process.env.LOCAL_MONGO_URI || "mongodb://0.0.0.0/0/NotesProject1";

  if (!atlasUri && !localUri) {
    console.error("No MongoDB URI configured. Set MONGO_URI or LOCAL_MONGO_URI.");
    return;
  }

  const tryConnect = async (uri) => {
    await mongoose.connect(uri, connectOptions);
    console.log(`MONGODB CONNECTED SUCCESSFULLY: ${uri.includes("0.0.0.0") ? "local" : "atlas"}`);
  };

  if (atlasUri) {
    try {
      await tryConnect(atlasUri);
      return;
    } catch (error) {
      console.warn("Atlas MongoDB connection failed, trying local MongoDB fallback:", error.message);
    }
  }

  if (localUri) {
    try {
      await tryConnect(localUri);
      return;
    } catch (error) {
      console.error("Local MongoDB connection failed:", error.message);
    }
  }

  console.error("MongoDB connection failed for both Atlas and local URIs.");
};
