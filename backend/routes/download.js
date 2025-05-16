const express = require("express");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/authMiddleware");
const PDF = require("../models/PDF");
const SharedPDF = require("../models/SharedPDF");

const router = express.Router();

// Ensure temp folder exists
const tempDir = path.join(__dirname, "..", "uploads", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ✅ Serve static files for uploads
// router.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ✅ Add back the missing search route!
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ msg: "Search query is required" });
    }

    // First, get all PDF IDs that are shared with the current user
    const sharedPDFs = await SharedPDF.find({ sharedWith: userId })
      .select("pdfId")
      .lean();
    const sharedPDFIds = sharedPDFs.map((share) => share.pdfId);

    // Find PDFs by bookName or topic (case insensitive)
    const searchResults = await PDF.find({
      $and: [
        {
          $or: [
            { isPublic: true },
            { uploadedBy: userId },
            { _id: { $in: sharedPDFIds } }, // Include PDFs shared with the user
          ],
        },
        {
          $or: [
            { bookName: { $regex: query, $options: "i" } },
            { topic: { $regex: query, $options: "i" } },
          ],
        },
      ],
    });

    // Add full file URL to each PDF
    const updatedResults = searchResults.map((pdf) => ({
      ...pdf.toObject(),
      fileUrl: pdf.filePath ? `${pdf.filePath}` : null,
    }));

    res.json(updatedResults);
  } catch (error) {
    console.error("Error searching PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Merge and Download PDFs
router.post("/merge", authMiddleware, async (req, res) => {
  try {
    const { pdfIds } = req.body;
    if (!pdfIds || pdfIds.length === 0) {
      return res.status(400).json({ msg: "No PDFs selected" });
    }

    let pdfFiles = await PDF.find({ _id: { $in: pdfIds } });
    pdfFiles.sort(
      (a, b) =>
        pdfIds.indexOf(a._id.toString()) - pdfIds.indexOf(b._id.toString())
    );

    const mergedPdf = await PDFDocument.create();
    const axios = require("axios");

    for (const pdf of pdfFiles) {
      const response = await axios.get(pdf.filePath, {
        responseType: "arraybuffer",
      });
      const pdfBytes = response.data;

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const fileName = `merged_${uuidv4()}.pdf`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, await mergedPdf.save());

    res.json({
      msg: "PDF merged successfully",
      fileUrl: `/uploads/temp/${fileName}`,
    });
  } catch (error) {
    console.error("Error merging PDFs:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
