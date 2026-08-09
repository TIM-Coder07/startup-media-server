import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const router = Router();

/*
========================================
POST - Founder sends profile request
========================================
*/
router.post("/", async (req, res) => {
    try {
        const founder = req.body;

        // Basic validation
        if (!founder.name || !founder.email) {
            return res.status(400).json({
                success: false,
                message: "Name and Email are required",
            });
        }

        // Check if founder already has a pending request
        const existingRequest = await db
            .collection("founderRequests")
            .findOne({
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
        const existingFounder = await db
            .collection("founders")
            .findOne({
                email: founder.email,
            });

        if (existingFounder) {
            return res.status(409).json({
                success: false,
                message: "Founder profile already exists",
            });
        }

        const request = {
            ...founder,
            status: "pending",
            createdAt: new Date(),
        };

        const result = await db
            .collection("founderRequests")
            .insertOne(request);

        res.status(201).json({
            success: true,
            insertedId: result.insertedId,
            message: "Profile request sent to admin",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to submit founder request",
        });
    }
});


/*
========================================
GET - All Founder Requests
Admin uses this
========================================
*/
router.get("/", async (_req, res) => {
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


/*
========================================
ACCEPT Founder Request
========================================
*/
router.patch("/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID",
            });
        }

        const requestId = new ObjectId(id);

        // Find request
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

        // Check duplicate founder
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

        // Create founder profile
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
            createdAt: new Date(),
        };

        await db
            .collection("founders")
            .insertOne(founder);

        // Update request status
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
});


/*
========================================
REJECT Founder Request
========================================
*/
router.patch("/:id/reject", async (req, res) => {
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
            message: "Failed to reject request",
        });
    }
});


export default router;