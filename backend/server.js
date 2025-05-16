const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/user", require("./routes/user"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/pdf", require("./routes/upload")); // Handles uploads
app.use("/api/myfiles", require("./routes/myfiles")); // Handles fetching, updating, and deleting PDFs
app.use("/api/download", require("./routes/download")); // Handles search & merging
app.use("/api/share", require("./routes/share")); // Handles PDF sharing
app.use("/api/profile", require("./routes/profile")); // Handles profile management

// ✅ Serve uploaded PDFs
app.use("/uploads", express.static("uploads"));

// ✅ Serve temporary merged PDFs
const tempDir = path.join(__dirname, "uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
app.use("/uploads/temp", express.static(tempDir));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ Cleanup old merged PDFs every 10 minutes
const cleanupMergedFiles = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        const now = Date.now();
        if (now - stats.ctimeMs > 10 * 60 * 1000) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      });
    });
  });
};

setInterval(cleanupMergedFiles, 10 * 60 * 1000);
