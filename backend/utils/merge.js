const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const mergePDFs = async (pdfPaths) => {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedFileName = `merged_${uuidv4()}.pdf`;
    const mergedFilePath = path.join(
      __dirname,
      "../uploads/temp",
      mergedFileName
    );

    fs.writeFileSync(mergedFilePath, mergedPdfBytes);
    return mergedFileName;
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw error;
  }
};

module.exports = mergePDFs;
