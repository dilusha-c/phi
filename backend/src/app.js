const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const patientRoutes = require("./routes/patientRoutes");
const dengueCaseRoutes = require("./routes/dengueCaseRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const mapRoutes = require("./routes/mapRoutes");
const dailyActivityRoutes = require("./routes/dailyActivityRoutes");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middlewares/authMiddleware");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

// Ensure database is connected on serverless request invocation
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB(process.env.MONGODB_URI);
      const adminExists = await User.findOne({ email: "phi123123@gmail.com" });
      if (!adminExists) {
        await User.create({
          name: "System Admin",
          email: "phi123123@gmail.com",
          password: "jbjbdabkjdghsbcsa",
          phoneNumber: "0000000000",
          role: "Admin",
        });
      }
    }
  } catch (err) {
    console.error("Database connection failure:", err.message);
  }
  next();
});

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Healthcare surveillance API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", protect, patientRoutes);
app.use("/api/cases", protect, dengueCaseRoutes);
app.use("/api/inspections", protect, inspectionRoutes);
app.use("/api/followups", protect, followUpRoutes);
app.use("/api/map", protect, mapRoutes);
app.use("/api/daily-activities", protect, dailyActivityRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
