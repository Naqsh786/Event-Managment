import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

let cached = globalThis.mongoose;

if (!cached) {
    cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
        };

        const mongoUri = process.env.DATABASE;
        if (!mongoUri) {
            throw new Error("DATABASE is not defined in .env file");
        }

        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("❌ MongoDB Connection Error:", e.message);
        throw e;
    }

    return cached.conn;
}

export default connectDB;
