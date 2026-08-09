import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_DB_URI!;

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectDB() {
  await client.connect();

  console.log("MongoDB Connected");
}

export const db = client.db("startup-media");