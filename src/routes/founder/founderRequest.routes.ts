import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const router = Router();

// ==========================================
// POST - Founder sends profile request
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

        // Check pending request
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

        // Check approved founder
        const existingFounder = await db
            .collection("founders")
            .findOne({
                email: founder.email,
                status: "approved",
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
            updatedAt: new Date(),
        };

        const result = await db
            .collection("founderRequests")
            .insertOne(request);

        res.status(201).json({
            success: true,
            message: "Profile request sent to admin",
            insertedId: result.insertedId,
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
// GET - Current user's request
// ==========================================
router.get("/me", async (req, res) => {
    console.log("🔥 /founder-requests/me HIT");

    try {
        const email = req.query.email as string;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // 1. First check approved founder
        const founder = await db
            .collection("founders")
            .findOne({
                email,
                status: "approved",
            });

        if (founder) {
            return res.status(200).json({
                success: true,
                type: "profile",
                status: "approved",
                data: founder,
            });
        }

        // 2. Check latest request
        const request = await db
            .collection("founderRequests")
            .findOne(
                { email },
                {
                    sort: {
                        createdAt: -1,
                    },
                }
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "No profile or request found",
            });
        }

        return res.status(200).json({
            success: true,
            type: "request",
            status: request.status,
            data: request,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile status",
        });
    }
});

// ==========================================
// GET - All pending requests
// ==========================================
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

export default router;