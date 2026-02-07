import mongoose from 'mongoose';
import colors from 'colors';

// Connect MongoDB
const connectDB = async() => {
   try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected To MongoDB DataBase ${conn.connection.host}`.bgMagenta.white);
    
   } catch (error) {
        console.log(`MongoDB connection failed: ${error.message}`.bgRed.white);
        process.exit(1);
   }
};

export  default connectDB;