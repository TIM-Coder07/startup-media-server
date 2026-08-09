console.log("✅ saved-founder.route.ts loaded");
import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db";

const router = Router();

const savedFounderCollection = db.collection("saved-founders");

/**
 * Save Startup
 * POST /saved-founders
 */
router.post("/", async (req, res) => {
  try {
    const saveData = req.body;

    const existing = await savedFounderCollection.findOne({
      investorId: saveData.investorId,
      startupId: saveData.startupId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Startup already saved.",
      });
    }

    const result = await savedFounderCollection.insertOne(saveData);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
      message: "Startup saved successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

/**
 * Get Saved Startups By Email
 * GET /saved-founders?email=user@gmail.com
 */
router.get("/", async (req, res) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result = await savedFounderCollection
      .find({
        investorEmail: email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

/**
 * Delete Saved Startup
 * DELETE /saved-founders/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await savedFounderCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved startup not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Saved startup removed successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;