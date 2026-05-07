require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const presenterRoutes = require("./routes/presenter.routes");
const presentationRoutes = require("./routes/presentation.routes");
const apiRoutes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

async function bootstrap() {
  await connectDB();
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use("/api/auth", authRoutes);
  app.use("/api/presenters", presenterRoutes);
  app.use("/api/presentations", presentationRoutes);
  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  // Default 5001 — port 5000 is often used by other dev stacks (e.g. Flask) and causes confusing 404s.
  const PORT = Number(process.env.PORT) || 5001;
  const BASE_URL =
    process.env.API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://ui-verse-backend-qkuf.onrender.com"
      : `http://localhost:${PORT}`);
  app.listen(PORT, () => {
    console.log(`[HTTP] UIverse API listening on port ${PORT}`);
    console.log(`[HTTP] Base URL: ${BASE_URL}`);
    console.log(`[HTTP] API base: ${BASE_URL}/api`);
    console.log(`[HTTP] Auth register: POST ${BASE_URL}/api/auth/register`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
