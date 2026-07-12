import express from "express";
import cors from "cors";
import { db } from "./config/db";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

const usersCollection = db.collection("users");

// HEALTH CHECK
app.get("/", (_req, res) => {
  res.send("Server is running 🚀");
});

// AUTH ROUTES 
app.use("/api/v1/auth", authRoutes);

app.get("/users", async (_req, res) => {
  const users = await usersCollection.find().toArray();

  res.send(users);
});

export default app;