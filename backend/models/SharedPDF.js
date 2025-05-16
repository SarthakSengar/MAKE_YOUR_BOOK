const mongoose = require("mongoose");

const SharedPDFSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PDF",
    required: true,
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sharedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate shares
SharedPDFSchema.index({ pdfId: 1, sharedWith: 1 }, { unique: true });

module.exports = mongoose.model("SharedPDF", SharedPDFSchema); 