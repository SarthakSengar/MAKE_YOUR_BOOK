import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { CloudUpload, PictureAsPdf } from "@mui/icons-material";

const UploadSection = ({ userId }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [bookName, setBookName] = useState("");
  const [topic, setTopic] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!pdfFile || !bookName || !topic) {
      alert("Please fill all fields and select a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("bookName", bookName);
    formData.append("topic", topic);
    formData.append("isPublic", isPublic);
    formData.append("userId", userId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/pdf/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("PDF uploaded successfully!");
        setPdfFile(null);
        setPreviewUrl("");
        setBookName("");
        setTopic("");
        setIsPublic(true);
      } else {
        alert(`Upload failed: ${data.msg}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error, try again later.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // ⬆ Moved to top
        background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
        paddingTop: 4, // ⬆ Added spacing from the top
      }}
    >
      <Paper
        elevation={5}
        sx={{
          padding: 4,
          width: "900px",
          textAlign: "left",
          borderRadius: 3,
          boxShadow: 5,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3} color="#1E3A8A">
          Upload Your PDF
        </Typography>

        <TextField
          label="Book Name"
          variant="outlined"
          fullWidth
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Topic"
          variant="outlined"
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
          }
          label={isPublic ? "Public" : "Private"}
          sx={{ marginBottom: 2 }}
        />

        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUpload />}
          fullWidth
          sx={{
            marginBottom: 2,
            backgroundColor: "#2563EB", // Matches Download Section
            "&:hover": { backgroundColor: "#1E3A8A" },
          }}
        >
          Select PDF
          <input type="file" hidden onChange={handleFileChange} />
        </Button>

        {previewUrl && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="#1E3A8A">
              PDF Preview:
            </Typography>
            <iframe
              src={previewUrl}
              width="100%"
              height="300px"
              style={{
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "10px",
              }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdf />}
          onClick={handleUpload}
          fullWidth
          sx={{
            marginTop: 3,
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#1E3A8A", // Matches Download Section
            "&:hover": { backgroundColor: "#102A63" },
          }}
        >
          Upload PDF
        </Button>
      </Paper>
    </Box>
  );
};

export default UploadSection;
