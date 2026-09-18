import { Router } from "express";
import { db } from "../../config/db";

const router = Router();

const founderReportCollection = db.collection("founderReports");

// ======================================================
// GET ALL FOUNDER REPORTS
// ======================================================

router.get("/founder-reports", async (_req, res) => {
    
} )