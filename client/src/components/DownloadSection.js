import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const DownloadSection = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim() !== "") {
      fetchPdfs();
    } else {
      setResults([]);
    }
  }, [query]);

  const fetchPdfs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/download/search?q=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data);
    } catch (error) {
      setError("Failed to fetch PDFs. Please try again.");
    }
  };

  const toggleSelectPdf = (pdf) => {
    setSelectedPdfs((prev) =>
      prev.some((p) => p._id === pdf._id)
        ? prev.filter((p) => p._id !== pdf._id)
        : [...prev, pdf]
    );
  };

  const movePdf = (index, direction) => {
    setSelectedPdfs((prev) => {
      const newList = [...prev];
      [newList[index], newList[index + direction]] = [
        newList[index + direction],
        newList[index],
      ];
      return newList;
    });
  };

  const downloadMergedPdf = async () => {
    if (selectedPdfs.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/download/merge",
        { pdfIds: selectedPdfs.map((pdf) => pdf._id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.fileUrl) {
        const downloadLink = document.createElement("a");
        downloadLink.href = `http://localhost:5000${response.data.fileUrl}`;
        downloadLink.setAttribute("download", "merged.pdf");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        throw new Error("No file URL received");
      }
    } catch (error) {
      setError("Failed to merge PDFs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Aligns content to the top
        height: "100vh",
        paddingTop: "20px", // Adds space from the top
        background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card sx={{ width: 900, p: 3, borderRadius: 3, boxShadow: 5 }}>
        <Typography variant="h4" fontWeight="bold" mb={3} color="#1E3A8A">
          Download PDFs
        </Typography>

        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search PDFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton onClick={fetchPdfs} color="primary">
            <SearchIcon />
          </IconButton>
          {query && (
            <IconButton onClick={() => setQuery("")} color="error">
              <ClearIcon />
            </IconButton>
          )}
        </Box>

        {/* Error Message */}
        {error && <Typography color="error">{error}</Typography>}

        {/* Results Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 200, mb: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Book Name</b>
                </TableCell>
                <TableCell>
                  <b>Topic</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((pdf) => (
                <TableRow key={pdf._id}>
                  <TableCell>{pdf.bookName}</TableCell>
                  <TableCell>{pdf.topic}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => toggleSelectPdf(pdf)}
                      color={
                        selectedPdfs.some((p) => p._id === pdf._id)
                          ? "error"
                          : "success"
                      }
                    >
                      {selectedPdfs.some((p) => p._id === pdf._id) ? (
                        <RemoveCircleOutlineIcon />
                      ) : (
                        <AddCircleOutlineIcon />
                      )}
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        console.log(pdf.filePath);
                        setPreviewPdf(`${pdf.filePath}`);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Selected PDFs */}
        <Typography variant="h6">Selected PDFs</Typography>
        {selectedPdfs.map((pdf, index) => (
          <Box
            key={pdf._id}
            sx={{ display: "flex", alignItems: "center", my: 1 }}
          >
            <Typography>{pdf.bookName}</Typography>
            <IconButton
              onClick={() => movePdf(index, -1)}
              disabled={index === 0}
            >
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton
              onClick={() => movePdf(index, 1)}
              disabled={index === selectedPdfs.length - 1}
            >
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton color="error" onClick={() => toggleSelectPdf(pdf)}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        {/* Download Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#1E3A8A",
            "&:hover": { backgroundColor: "#102A63" },
          }}
          startIcon={
            loading ? <CircularProgress size={20} /> : <CloudDownloadIcon />
          }
          disabled={selectedPdfs.length === 0 || loading}
          onClick={downloadMergedPdf}
        >
          {loading ? "Merging..." : "Download Merged PDF"}
        </Button>
      </Card>

      {/* PDF Preview Modal */}
      <Dialog
        open={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent>
          <iframe src={previewPdf} width="100%" height="500px" />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DownloadSection;
