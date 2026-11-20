
const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const questionRoutes = require("./routes/questionRoutes");
const codingRoutes = require("./routes/codingRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const testRoutes = require("./routes/testRoutes");
const resultRoutes = require("./routes/resultRoutes");
const materialRoutes = require("./routes/materialRoutes");
const progressRoutes = require("./routes/progressRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Placement Portal Backend is Running",
    status: "OK",
  });
});

app.use(require("./middleware/notFoundMiddleware"));
app.use(require("./middleware/errorMiddleware"));

module.exports = app;
