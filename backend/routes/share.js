const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SharedPDF = require("../models/SharedPDF");
const PDF = require("../models/PDF");
const User = require("../models/User");

// Share a PDF with another user
router.post("/share", authMiddleware, async (req, res) => {
  try {
    const { pdfId, userEmail } = req.body;
    const sharedBy = req.user;

    // Find the user to share with
    const userToShareWith = await User.findOne({ email: userEmail });
    if (!userToShareWith) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if PDF exists and belongs to the user
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ msg: "PDF not found" });
    }
    if (pdf.uploadedBy.toString() !== sharedBy) {
      return res.status(403).json({ msg: "Not authorized to share this PDF" });
    }

    // Create share record
    const sharedPDF = new SharedPDF({
      pdfId,
      sharedBy,
      sharedWith: userToShareWith._id,
    });

    await sharedPDF.save();
    res.json({ msg: "PDF shared successfully", sharedPDF });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "PDF already shared with this user" });
    }
    console.error("Error sharing PDF:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get PDFs shared with me
router.get("/shared-with-me", authMiddleware, async (req, res) => {
  try {
    const sharedPDFs = await SharedPDF.find({ sharedWith: req.user })
      .populate("pdfId")
      .populate("sharedBy", "username email")
      .sort({ sharedAt: -1 });

    res.json(sharedPDFs);
  } catch (error) {
    console.error("Error fetching shared PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get PDFs I've shared with others
router.get("/shared-by-me", authMiddleware, async (req, res) => {
  try {
    const sharedPDFs = await SharedPDF.find({ sharedBy: req.user })
      .populate("pdfId")
      .populate("sharedWith", "username email")
      .sort({ sharedAt: -1 });

    res.json(sharedPDFs);
  } catch (error) {
    console.error("Error fetching shared PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Remove a share
router.delete("/remove-share/:id", authMiddleware, async (req, res) => {
  try {
    const shareId = req.params.id;
    const share = await SharedPDF.findById(shareId);

    if (!share) {
      return res.status(404).json({ msg: "Share not found" });
    }

    if (share.sharedBy.toString() !== req.user) {
      return res
        .status(403)
        .json({ msg: "Not authorized to remove this share" });
    }

    await SharedPDF.deleteOne({ _id: shareId });
    res.json({ msg: "Share removed successfully" });
  } catch (error) {
    console.error("Error removing share:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
