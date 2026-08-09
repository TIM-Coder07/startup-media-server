import { Router } from "express";
import { db } from "../config/db";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const startups = await db
      .collection("browse-startups")
      .find()
      .toArray();

    res.status(200).json(startups);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch startups",
    });
  }
});

// BROWSE-STARTUP API 

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid startup id",
      });
    }

    const startup = await db.collection("browse-startups").findOne({
      _id: new ObjectId(id),
    });

    if (!startup) {
      return res.status(404).json({
        message: "Startup not found",
      });
    }

    res.status(200).json(startup);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;