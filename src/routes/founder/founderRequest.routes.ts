import { Router } from "express";
import { db } from "../../config/db";

const router = Router();

// ==========================================
// POST - Create Founder Request
// ==========================================
router.post("/", async (req, res) => {
    try {
        const founder = req.body;

        console.log("Founder request received:", founder);

        if (!founder.name || !founder.email) {
            return res.status(400).json({
                success: false,
                message: "Name and Email are required",
            });
        }

        // ==========================================
        // Check pending request
        // ==========================================

        const pendingRequest = await db
            .collection("founderRequests")
            .findOne({
                email: founder.email,
                status: "pending",
            });

        if (pendingRequest) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have a pending request",
            });
        }

        // ==========================================
        // Create request
        // ==========================================

        const requestData = {
            name: founder.name,
            email: founder.email,
            industry: founder.industry,
            experience: founder.experience,
            location: founder.location,
            linkedin: founder.linkedin,
            profileImage: founder.profileImage,
            skills: Array.isArray(founder.skills)
                ? founder.skills
                : [],
            bio: founder.bio,

            status: "pending",

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("founderRequests")
            .insertOne(requestData);

        const request = await db
            .collection("founderRequests")
            .findOne({
                _id: result.insertedId,
            });

        console.log(
            "Founder request created:",
            request
        );

        return res.status(201).json({
            success: true,
            message:
                "Profile submitted for admin approval",
            request,
        });

    } catch (error) {
        console.error(
            "POST /founder-requests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit founder request",
        });
    }
});


// ==========================================
// GET - Current User Profile / Request
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

        // ==========================================
        // Check founder
        // ==========================================

        const founder = await db
            .collection("founders")
            .findOne({
                email,
            });

        // ==========================================
        // Latest request
        // ==========================================

        const request = await db
            .collection("founderRequests")
            .findOne(
                {
                    email,
                },
                {
                    sort: {
                        createdAt: -1,
                    },
                }
            );

        // ==========================================
        // Nothing found
        // ==========================================

        if (!founder && !request) {
            return res.status(404).json({
                success: false,
                message:
                    "No profile or request found",
            });
        }

        // ==========================================
        // Pending request
        // ==========================================

        if (
            request &&
            request.status === "pending"
        ) {
            return res.status(200).json({
                success: true,
                type: "request",
                status: "pending",
                data: request,
            });
        }

        // ==========================================
        // Rejected request
        // ==========================================

        if (
            request &&
            request.status === "rejected"
        ) {
            return res.status(200).json({
                success: true,
                type: "request",
                status: "rejected",
                data: request,
            });
        }

        // ==========================================
        // Approved
        // ==========================================

        if (
            founder &&
            founder.status === "approved"
        ) {
            return res.status(200).json({
                success: true,
                type: "profile",
                status: "approved",
                data: founder,
            });
        }

        // ==========================================
        // Suspended
        // ==========================================

        if (
            founder &&
            founder.status === "suspended"
        ) {
            return res.status(200).json({
                success: true,
                type: "profile",
                status: "suspended",
                data: founder,
            });
        }

        // ==========================================
        // Disabled
        // ==========================================

        if (
            founder &&
            founder.status === "disabled"
        ) {
            return res.status(200).json({
                success: true,
                type: "profile",
                status: "disabled",
                data: founder,
            });
        }

        return res.status(404).json({
            success: false,
            message:
                "No profile or request found",
        });

    } catch (error) {
        console.error(
            "GET /founder-requests/me error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch profile status",
        });
    }
});


// ==========================================
// GET - All Pending Requests
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

        return res.status(200).json({
            success: true,
            requests,
        });

    } catch (error) {
        console.error(
            "GET /founder-requests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch founder requests",
        });
    }
});

export default router;