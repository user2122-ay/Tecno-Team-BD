require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const subdivisionRoutes = require("./routes/subdivisions");
const memberRoutes = require("./routes/members");
const attendanceRoutes = require("./routes/attendance");
const activityRoutes = require("./routes/activities");
const userRoutes = require("./routes/users");

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Tecno Team API" }));

app.use("/api/auth", authRoutes);
app.use("/api/subdivisions", subdivisionRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Tecno Team API corriendo en puerto ${PORT}`));
