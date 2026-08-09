import { Router } from "express";
import { db } from "../../config/db";

const router = Router();

const applicationCollection = db.collection("applications");
const savedCollection = db.collection("saved-founders");

router.get("/:investorId", async (req, res) => {
  try {
    const { investorId } = req.params;

    const applications = await applicationCollection
      .find({ investorId })
      .toArray();

    const saved = await savedCollection
      .find({ investorId })
      .toArray();

    const totalInvestment = applications.reduce(
      (sum, item) => sum + Number(item.fundingGoal),
      0
    );

    const pending = applications.filter(
      (item) => item.status === "Pending"
    ).length;

    const accepted = applications.filter(
      (item) => item.status === "Accepted"
    ).length;

    const rejected = applications.filter(
      (item) => item.status === "Rejected"
    ).length;

    res.json({
      totalInvestment,
      totalApplications: applications.length,
      pending,
      accepted,
      rejected,
      saved: saved.length,
      applications,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;