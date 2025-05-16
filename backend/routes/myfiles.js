const express = require("express");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");
const PDF = require("../models/PDF");

const router = express.Router();

// ✅ Fetch user's uploaded PDFs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const userPdfs = await PDF.find({ uploadedBy: userId });
    res.json(userPdfs);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Change public/private status (Only Owner)
router.put("/update-visibility/:id", authMiddleware, async (req, res) => {
  try {
    const pdfId = req.params.id;
    const { isPublic } = req.body;
    const userId = req.user;

    const pdf = await PDF.findById(pdfId);

    if (!pdf) return res.status(404).json({ msg: "PDF not found" });

    // Ownership check
    if (pdf.uploadedBy.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to update this PDF" });
    }

    pdf.isPublic = isPublic;
    await pdf.save();

    res.json({ msg: "Visibility updated", pdf });
  } catch (error) {
    console.error("Error updating visibility:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete a PDF (Only Owner)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const pdfId = req.params.id;
    const userId = req.user;

    const pdf = await PDF.findById(pdfId);

    if (!pdf) return res.status(404).json({ msg: "PDF not found" });

    // Ownership check
    if (pdf.uploadedBy.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to delete this PDF" });
    }
    const cloudinary = require("../config/cloudinary");
    // Extract public_id from filePath
    const publicId = pdf.filePath
      .split("/")
      .slice(-2) // ['MakeYourBook', 'filename']
      .join("/")
      .replace(".pdf", ""); // remove extension if present

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Remove from DB
    await PDF.findByIdAndDelete(pdfId);
    res.json({ msg: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
