import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_DB_URI;

if (!uri) {
  throw new Error("MONGO_DB_URI is not defined");
}

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectDB() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

export const db = client.db("startup-media");