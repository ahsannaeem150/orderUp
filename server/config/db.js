import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.GLOBAL_MONGO_URL);
    console.log(`Connected to DB ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.log(`Error in DB error ${error}`.bgCyan.white);
  }
};

export default connectDB;
