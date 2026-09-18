import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";

import startupRoute from "./routes/startup.route";
import coFounderRoute from "./routes/founder/founder.route";
import profileRoute from "./routes/profile.route";
import userRoute from "./routes/user.route";
import applicationRoutes from "./routes/application.route";
import savedFounderRoutes from "./routes/saved-founder.route";

import investorOverviewRoute from "./routes/insvestor/investor.overview";
import founderOverviewRoute from "./routes/founder/founderOverview";
import founderRequestRoutes from "./routes/founder/founderRequest.routes";
import adminActionRoutes from "./routes/admin/admin.action.routes";

// Make sure this file actually exists
import notificationRoute from "./routes/founder/founder.notification";

const app = express();

// =====================================================
// Middleware
// =====================================================

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

// =====================================================
// Root
// =====================================================

app.get("/", (_req, res) => {
    res.send("Server Running 🚀");
});

// =====================================================
// Better Auth
// =====================================================

app.all(
    "/api/auth/{*any}",
    toNodeHandler(auth)
);

// =====================================================
// Browse Startup
// =====================================================

app.use(
    "/browse-startups",
    startupRoute
);

// =====================================================
// Founder
// =====================================================

app.use(
    "/founders",
    coFounderRoute
);

// =====================================================
// Profile
// =====================================================

app.use(
    "/profile",
    profileRoute
);

// =====================================================
// Users
// =====================================================

app.use(
    "/api/users",
    userRoute
);

// =====================================================
// Saved Founders
// =====================================================

app.use(
    "/saved-founders",
    savedFounderRoutes
);

// =====================================================
// Investor
// =====================================================

app.use(
    "/investor-overview",
    investorOverviewRoute
);

app.use(
    "/applications",
    applicationRoutes
);

// =====================================================
// Founder Overview
// =====================================================

app.use(
    "/founder-overview",
    founderOverviewRoute
);

// =====================================================
// Founder Notifications
// =====================================================

app.use(
    "/api/notifications",
    notificationRoute
);

// =====================================================
// Founder Requests
// =====================================================

app.use(
    "/founder-requests",
    founderRequestRoutes
);

// =====================================================
// Admin
// =====================================================

app.use(
    "/api",
    adminActionRoutes
);

export default app;