import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.DB_URI as string)
      .then((data) =>
        console.log(`Database is connected with ${data.connection.host}`)
      );
  } catch (error: any) {
    console.log(`DB_CONNECTION_FAILED:${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
