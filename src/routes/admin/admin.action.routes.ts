import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const router = Router();

// ==========================================
// GET - Pending Founder Requests
// ==========================================
router.get("/founder-requests", async (_req, res) => {
    try {
        const requests = await db
            .collection("founderRequests")
            .find({
                status: "pending",
            })
            .sort({
                createdAt: -1,
            })
            .toArray();

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch founder requests",
        });
    }
});

// ==========================================
// APPROVE
// ==========================================
router.patch(
    "/founder-requests/:id/approve",
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID",
                });
            }

            const requestId = new ObjectId(id);

            // Find pending request
            const request = await db
                .collection("founderRequests")
                .findOne({
                    _id: requestId,
                    status: "pending",
                });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: "Pending request not found",
                });
            }

            // Check existing founder
            const existingFounder = await db
                .collection("founders")
                .findOne({
                    email: request.email,
                });

            if (existingFounder) {
                return res.status(409).json({
                    success: false,
                    message: "Founder profile already exists",
                });
            }

            // Create approved founder
            const founder = {
                name: request.name,
                email: request.email,
                industry: request.industry,
                experience: request.experience,
                location: request.location,
                linkedin: request.linkedin,
                profileImage: request.profileImage,
                skills: request.skills,
                bio: request.bio,

                status: "approved",

                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await db
                .collection("founders")
                .insertOne(founder);

            // Update request
            await db
                .collection("founderRequests")
                .updateOne(
                    {
                        _id: requestId,
                    },
                    {
                        $set: {
                            status: "approved",
                            approvedAt: new Date(),
                            updatedAt: new Date(),
                        },
                    }
                );

            res.status(200).json({
                success: true,
                message: "Founder approved successfully",
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to approve founder",
            });
        }
    }
);

// ==========================================
// REJECT
// ==========================================
router.patch(
    "/founder-requests/:id/reject",
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID",
                });
            }

            const result = await db
                .collection("founderRequests")
                .updateOne(
                    {
                        _id: new ObjectId(id),
                        status: "pending",
                    },
                    {
                        $set: {
                            status: "rejected",
                            rejectedAt: new Date(),
                            updatedAt: new Date(),
                        },
                    }
                );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Pending request not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Founder request rejected",
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to reject founder",
            });
        }
    }
);

export default router;