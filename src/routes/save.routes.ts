import { Router } from "express";
import { db } from "../config/db";

const router = Router();

const savedFounderCollection = db.collection("saved-founders");

console.log("✅ saved-founder.route.ts loaded");

router.post("/", async (req, res) => {
  try {
    const saveData = req.body;

    const existing = await savedFounderCollection.findOne({
      investorId: saveData.investorId,
      founderId: saveData.founderId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Founder already saved.",
      });
    }

    const result = await savedFounderCollection.insertOne(saveData);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;