import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db";

const router = Router();
const applicationCollection= db.collection("applications");

/**
 * Create Application
 */
router.post("/", async (req, res) => {
  try {
    const application = req.body;

    const existing = await applicationCollection.findOne({
      startupId: application.startupId,
      investorId: application.investorId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already invested in this startup.",
      });
    }

    const result = await applicationCollection.insertOne(application);

    res.status(201).json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Get Applications by Investor
 */
router.get("/", async (req, res) => {
  try {
    const { investorId } = req.query;

    const result = await applicationCollection
      .find({
        investorId: investorId as string,
      })
      .toArray();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});


// DELETE API 
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await applicationCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// VIEW API ROUTE
router.get("/:id", async (req, res) => {
  try {
    const application = await applicationCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!application) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json(application);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;