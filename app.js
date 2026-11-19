
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const dbConnect = require("./db/connect");

require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:3030",
  "http://127.0.0.1:3030",
  "https://anshu-oss-code-judge.vercel.app",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked this origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "code-judge-api",
  });
});

// API routes
app.use("/api", require("./routes"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

const startServer = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI or MONGO_URL environment variable");
  }

  await dbConnect(MONGO_URI);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start Code Judge API:", error);
  process.exit(1);
});
