import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const router = Router();

const foundersCollection = db.collection("founders");
const requestsCollection = db.collection("founderRequests");

// ======================================================
// GET ALL FOUNDERS
// ======================================================

router.get("/founders", async (_req, res) => {
  try {
    const founders = await foundersCollection
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return res.status(200).json({
      success: true,
      founders,
    });
  } catch (error) {
    console.error("GET /admin/founders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch founders",
    });
  }
});

// ======================================================
// GET SINGLE FOUNDER
// ======================================================

router.get("/founders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    const founder = await foundersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    return res.status(200).json({
      success: true,
      founder,
    });
  } catch (error) {
    console.error("GET /admin/founders/:id error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch founder",
    });
  }
});

// ======================================================
// SUSPEND FOUNDER
// ======================================================

router.patch("/founders/:id/suspend", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    // ==========================================
    // Find founder
    // ==========================================

    const founder = await foundersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    // ==========================================
    // Suspend founder
    // ==========================================

    await foundersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "suspended",
          updatedAt: new Date(),
        },
      },
    );

    // ==========================================
    // Create notification
    // ==========================================

    await db.collection("notifications").insertOne({
      recipientEmail: founder.email,

      recipientRole: "founder",

      type: "account_action",

      title: "Account Suspended",

      message: "Your founder account has been suspended by admin.",

      action: "suspended",

      read: false,

      createdAt: new Date(),

      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Founder suspended successfully",
    });
  } catch (error) {
    console.error("Suspend founder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to suspend founder",
    });
  }
});

// ======================================================
// DISABLE FOUNDER
// ======================================================

router.patch("/founders/:id/disable", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    const result = await foundersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "disabled",
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

    return res.status(200).json({
      success: true,
      message: "Founder disabled successfully",
    });
  } catch (error) {
    console.error("Disable founder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to disable founder",
    });
  }
});

// ======================================================
// ACTIVATE / ENABLE FOUNDER
// ======================================================

router.patch("/founders/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    const result = await foundersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "approved",
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

    return res.status(200).json({
      success: true,
      message: "Founder activated successfully",
    });
  } catch (error) {
    console.error("Activate founder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate founder",
    });
  }
});

// ======================================================
// DELETE FOUNDER
// ======================================================

router.delete("/founders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    const founder = await foundersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    // Delete founder profile
    await foundersCollection.deleteOne({
      _id: new ObjectId(id),
    });

    // Delete related requests
    await requestsCollection.deleteMany({
      email: founder.email,
    });

    return res.status(200).json({
      success: true,
      message: "Founder deleted successfully",
    });
  } catch (error) {
    console.error("Delete founder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete founder",
    });
  }
});

// ======================================================
// UPDATE FOUNDER STATUS
// ======================================================

router.patch("/founders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["approved", "suspended", "disabled"];

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid founder ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const result = await foundersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status,
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

    const updatedFounder = await foundersCollection.findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Founder status updated successfully",
      founder: updatedFounder,
    });
  } catch (error) {
    console.error("Update founder status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update founder status",
    });
  }
});

export default router;
