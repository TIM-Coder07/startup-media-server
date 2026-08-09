import { Router } from "express";
import { auth } from "../lib/auth";
import { db } from "../config/db";

const router = Router();

router.post("/", async (req, res) => {
  const usersCollection = db.collection("user");
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

    await usersCollection.updateOne(
      {
        email: session.user.email,
      },
      {
        $set: {
          role,
          profilePicture,
          name: session.user.name,
          email: session.user.email,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile Updated",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;
