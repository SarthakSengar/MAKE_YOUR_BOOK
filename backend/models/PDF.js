const mongoose = require("mongoose");

const PDFSchema = new mongoose.Schema({
  bookName: { type: String, required: true, index: true }, // Indexed for faster search
  topic: { type: String, required: true, index: true }, // Indexed for topic-based search
  isPublic: { type: Boolean, default: false },
  filePath: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: { type: Date, default: Date.now },
});

PDFSchema.index({ bookName: 1, topic: 1 }); // Compound index for optimized queries

module.exports = mongoose.model("PDF", PDFSchema);
