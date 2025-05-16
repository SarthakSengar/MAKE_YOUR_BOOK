const express = require("express");

const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");
const PDF = require("../models/PDF");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const fileExtension = path.extname(file.originalname); // Get the file extension
    const uniqueName = Date.now() + fileExtension; // Use extension only once

    console.log("Generated filename:", uniqueName);

    return {
      folder: "MakeYourBook", // Folder where the file will be stored
      public_id: uniqueName, // Unique file name without appending twice
      resource_type: "auto", // This is crucial for PDFs
    };
  },
});

const upload = multer({ storage });

// Upload PDF
router.post(
  "/upload",
  authMiddleware, // Make sure authMiddleware is correctly set up
  upload.single("pdf"),
  async (req, res) => {
    try {
      const { bookName, topic } = req.body;
      const isPublic = req.body.isPublic === "true"; // Ensure boolean
      const uploadedBy = req.user; // Extract user ID from authMiddleware

      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      // The file URL will be available in req.file.path after Cloudinary upload
      const fileUrl = req.file.path; // Cloudinary URL of the uploaded file

      // Create a new PDF record
      const newPDF = new PDF({
        bookName,
        topic,
        isPublic,
        filePath: fileUrl, // Save Cloudinary URL
        uploadedBy,
      });

      // Save the new PDF document to the database
      await newPDF.save();

      // Return success response with uploaded PDF details
      res.json({ msg: "PDF uploaded successfully", pdf: newPDF });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// New Route: Fetch user's uploaded PDFs
router.get("/myfiles", authMiddleware, async (req, res) => {
  try {
    const userId = req.user; // Get logged-in user ID
    const userPdfs = await PDF.find({ uploadedBy: userId }); // Fetch user's PDFs
    res.json(userPdfs);
  } catch (error) {
    console.error("Error fetching user PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Route to update the visibility of a PDF (PUT)
router.put("/update-visibility/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    // Find the PDF by ID and update its visibility
    const pdf = await PDF.findById(id);
    if (!pdf) {
      return res.status(404).json({ msg: "PDF not found" });
    }
    pdf.isPublic = isPublic;
    await pdf.save();
    res.json({ msg: "PDF visibility updated", pdf });
  } catch (error) {
    console.error("Error updating visibility:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Route to delete a PDF (DELETE)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the PDF by ID and delete it
    const pdf = await PDF.findById(id);
    if (!pdf) {
      return res.status(404).json({ msg: "PDF not found" });
    }
    await pdf.remove();
    res.json({ msg: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
