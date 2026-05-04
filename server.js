require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
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
  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  // Default 5001 — port 5000 is often used by other dev stacks (e.g. Flask) and causes confusing 404s.
  const PORT = Number(process.env.PORT) || 5001;
  app.listen(PORT, () => {
    console.log(`[HTTP] UIverse API listening on port ${PORT}`);
    console.log(`[HTTP] Local URL: http://localhost:${PORT}`);
    console.log(`[HTTP] API base: http://localhost:${PORT}/api`);
    console.log(
      `[HTTP] Auth register: POST http://localhost:${PORT}/api/auth/register`,
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
