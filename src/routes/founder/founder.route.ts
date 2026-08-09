import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const router = Router();

// ==========================================
// POST - Submit Founder Profile Request
// ==========================================
router.post("/", async (req, res) => {
  try {
    const founder = req.body;

    if (!founder.name || !founder.email) {
      return res.status(400).json({
        success: false,
        message: "Name and Email are required",
      });
    }

    // Check if this user already has a pending request
    const existingRequest = await db.collection("founderRequests").findOne({
      email: founder.email,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request",
      });
    }

    // Check if founder is already approved
    const existingFounder = await db.collection("founders").findOne({
      email: founder.email,
    });

    if (existingFounder) {
      return res.status(409).json({
        success: false,
        message: "Founder profile already exists",
      });
    }

    const result = await db.collection("founderRequests").insertOne({
      ...founder,

      status: "pending",

      createdAt: new Date(),

      updatedAt: new Date(),
    });

    const request = await db.collection("founderRequests").findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      success: true,
      message: "Founder request sent to admin",
      request,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to submit founder request",
    });
  }
});

// ==========================================
// GET - All Approved Founders
// ==========================================
router.get("/", async (_req, res) => {
  try {
    const founders = await db
      .collection("founders")
      .find()
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.status(200).json(founders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch founders",
    });
  }
});

// ==========================================
// GET - Current User Request/Profile
// ==========================================
router.get("/me", async (req, res) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // First check approved founder
    const founder = await db.collection("founders").findOne({
      email,
    });

    if (founder) {
      return res.status(200).json({
        type: "approved",
        data: founder,
      });
    }

    // If not approved, check pending request
    const request = await db.collection("founderRequests").findOne(
      {
        email,
      },
      {
        sort: {
          createdAt: -1,
        },
      },
    );

    if (request) {
      return res.status(200).json({
        type: "request",
        data: request,
      });
    }

    // Nothing found
    return res.status(404).json({
      success: false,
      message: "Profile not found",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// ==========================================
// GET - Single Founder
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const founder = await db.collection("founders").findOne({
      _id: new ObjectId(id),
    });

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    res.status(200).json(founder);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ==========================================
// PATCH - Update Approved Founder
// ==========================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    const updateData = {
      ...req.body,
    };

    delete updateData._id;

    const result = await db.collection("founders").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    const updatedFounder = await db.collection("founders").findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      founder: updatedFounder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

export default router;
