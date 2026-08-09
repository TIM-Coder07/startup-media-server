import { Router } from "express";
import { auth } from "../lib/auth";
import { db } from "../config/db";
import { ObjectId } from "mongodb";

const router = Router();

router.post("/profile", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { role, profilePicture } = req.body;

    await db.collection("user").updateOne(
      {
        _id: new ObjectId(session.user.id),
      },
      {
        $set: {
          role,
          profilePicture,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile Updated",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;