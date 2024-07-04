import exp from "constants";
import mongoose, { Mongoose } from "mongoose";
import { MongooseConnection } from "../../types/index";

const mongoDbUrl = process.env.MONGODB_URL;

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = {
    conn: null,
    promise: null,
  };
}

export const connectDb = async () => 
{
    if(cached.conn) return cached.conn;

    if(!mongoDbUrl) throw new Error("MongodbUrl is not defined!");

    try {
        cached.promise = cached.promise || mongoose.connect(mongoDbUrl,{dbName : "imaginify",bufferCommands : false})
        console.log("Database Connected!");
        cached.conn = await cached.promise;
        return cached.conn;
        
    } catch (error) {
        console.log("something went wrong while connect to db!");
        process.exit(1);
    }
};


