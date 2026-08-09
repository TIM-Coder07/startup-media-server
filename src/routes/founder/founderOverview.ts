import { Router } from "express";
import { db } from "../../config/db";

const router = Router();

const applicationCollection = db.collection("applications");
const savedCollection = db.collection("saved-founders");

const months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

router.get("/:founderId", async (req, res) => {
  try {
    const { founderId } = req.params;

    // ----------------------------
    // All Applications
    // ----------------------------

    const applications = await applicationCollection
      .find({
        founderId,
      })
      .toArray();

    // ----------------------------
    // Cards
    // ----------------------------

    const totalFundingRaised = applications
      .filter((item: any) => item.status === "Accepted")
      .reduce(
        (sum: number, item: any) =>
          sum + Number(item.fundingGoal || 0),
        0
      );

    const totalInvestors = new Set(
      applications.map((item: any) => item.investorId)
    ).size;

    const requests = applications.length;

    const savedByInvestors =
      await savedCollection.countDocuments({
        founderId,
      });

    // ----------------------------
    // Pie Chart
    // ----------------------------

    const pending = applications.filter(
      (item: any) => item.status === "Pending"
    ).length;

    const accepted = applications.filter(
      (item: any) => item.status === "Accepted"
    ).length;

    const rejected = applications.filter(
      (item: any) => item.status === "Rejected"
    ).length;

    const requestStatus = [
      {
        name: "Pending",
        value: pending,
      },
      {
        name: "Accepted",
        value: accepted,
      },
      {
        name: "Rejected",
        value: rejected,
      },
    ];

    // ----------------------------
    // Monthly Funding
    // ----------------------------

    const monthlyFundingRaw =
      await applicationCollection
        .aggregate([
          {
            $match: {
              founderId,
              status: "Accepted",
            },
          },
          {
            $group: {
              _id: {
                $month: {
                  $toDate: "$createdAt",
                },
              },
              amount: {
                $sum: "$fundingGoal",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();

    const monthlyFunding = monthlyFundingRaw.map(
      (item: any) => ({
        month: months[item._id],
        amount: item.amount,
      })
    );

    // ----------------------------
    // Profile Views (Fake)
    // ----------------------------

    const profileViewsByMonth = [
      { month: "Jan", views: 25 },
      { month: "Feb", views: 45 },
      { month: "Mar", views: 65 },
      { month: "Apr", views: 90 },
      { month: "May", views: 120 },
      { month: "Jun", views: 160 },
      { month: "Jul", views: 200 },
    ];

    const profileViews = profileViewsByMonth.reduce(
      (sum, item) => sum + item.views,
      0
    );

    // ----------------------------
    // Response
    // ----------------------------

    res.json({
      totalFundingRaised,
      totalInvestors,
      profileViews,
      savedByInvestors,
      requests,
      monthlyFunding,
      requestStatus,
      profileViewsByMonth,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;