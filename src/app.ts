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

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server Running 🚀");
});

// Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));

//Browse-Startup API
app.use("/browse-startups", startupRoute);

// Founder API
app.use("/founders", coFounderRoute);

// Profile API 
app.use("/profile", profileRoute);

// User Role & Image  API
app.use("/api/users", userRoute);

// save startup 
app.use("/saved-founders", savedFounderRoutes);

// ---------------------------
// INVESTOR API
// ---------------------------

// INVESTOR OVERVIEW ROUTE 
app.use("/investor-overview", investorOverviewRoute);

// My Investments API
app.use("/applications", applicationRoutes);

// -----------------------
// FOUNDER API
// -----------------------

// app.use("/api/founders", founderRoutes);

// Founder Overview API
app.use("/founder-overview", founderOverviewRoute);

// Founder Request API
app.use("/founder-requests",founderRequestRoutes);


// ----------------------------
// ADMIN API
// ----------------------------
app.use("/api", adminActionRoutes);



export default app;