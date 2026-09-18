import { Router } from "express";
import { db } from "../../config/db";

const router = Router();

const notificationsCollection =
    db.collection("notifications");

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

router.get("/me", async (req, res) => {
    try {
        const email = req.query.email as string;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const notifications =
            await notificationsCollection
                .find({
                    recipientEmail: email,
                })
                .sort({
                    createdAt: -1,
                })
                .toArray();

        return res.status(200).json({
            success: true,
            notifications,
        });

    } catch (error) {
        console.error(
            "GET /notifications/me error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
});

// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================

router.patch("/:id/read", async (req, res) => {
    try {
        const { ObjectId } = await import("mongodb");

        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const result =
            await notificationsCollection.updateOne(
                {
                    _id: new ObjectId(id),
                },
                {
                    $set: {
                        read: true,
                        updatedAt: new Date(),
                    },
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });

    } catch (error) {
        console.error(
            "Mark notification read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
});

export default router;