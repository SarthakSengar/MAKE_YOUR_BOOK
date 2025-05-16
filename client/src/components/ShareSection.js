import React, { useState, useEffect } from "react";
import {
  Box,
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Share, Delete, CloudDownload, Visibility } from "@mui/icons-material";
import axios from "axios";

const ShareSection = () => {
  const [tab, setTab] = useState(0);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [myPdfs, setMyPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);

  useEffect(() => {
    fetchSharedPDFs();
    fetchMyPdfs();
  }, []);

  const fetchSharedPDFs = async () => {
    try {
      const token = localStorage.getItem("token");
      const [withMeRes, byMeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/share/shared-with-me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/share/shared-by-me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSharedWithMe(withMeRes.data);
      setSharedByMe(byMeRes.data);
    } catch (error) {
      console.error("Error fetching shared PDFs:", error);
    }
  };

  const fetchMyPdfs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/myfiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPdfs(res.data);
    } catch (error) {
      console.error("Error fetching my PDFs:", error);
    }
  };

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/share/share",
        {
          pdfId: selectedPdf._id,
          userEmail: shareEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenShareDialog(false);
      setShareEmail("");
      fetchSharedPDFs();
    } catch (error) {
      alert(error.response?.data?.msg || "Error sharing PDF");
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/share/remove-share/${shareId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchSharedPDFs();
    } catch (error) {
      alert(error.response?.data?.msg || "Error removing share");
    }
  };

  const handleDownload = (fileUrl) => {
    window.open(`http://localhost:5000/${fileUrl}`, "_blank");
  };

  return (
    <Box
      sx={{
        padding: "20px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          padding: 4,
          width: "900px",
          borderRadius: 3,
          boxShadow: 5,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3} color="#1E3A8A">
          Share PDFs
        </Typography>

        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Shared with Me" />
          <Tab label="Shared by Me" />
          <Tab label="Share My PDFs" />
        </Tabs>

        {/* Shared with Me Tab */}
        {tab === 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Name</TableCell>
                  <TableCell>Shared By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sharedWithMe.map((share) => (
                  <TableRow key={share._id}>
                    <TableCell>{share.pdfId.bookName}</TableCell>
                    <TableCell>{share.sharedBy.username}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDownload(share.pdfId.filePath)}
                        color="primary"
                      >
                        <CloudDownload />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          setPreviewPdf(
                            `http://localhost:5000/${share.pdfId.filePath.replace(
                              /\\/g,
                              "/"
                            )}`
                          )
                        }
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Shared by Me Tab */}
        {tab === 1 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Name</TableCell>
                  <TableCell>Shared With</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sharedByMe.map((share) => (
                  <TableRow key={share._id}>
                    <TableCell>
                      {share.pdfId ? share.pdfId.bookName : "Deleted Book"}
                    </TableCell>
                    <TableCell>
                      {share.sharedWith?.email || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleRemoveShare(share._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Share My PDFs Tab */}
        {tab === 2 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myPdfs.map((pdf) => (
                  <TableRow key={pdf._id}>
                    <TableCell>{pdf.bookName}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedPdf(pdf);
                          setOpenShareDialog(true);
                        }}
                        color="primary"
                      >
                        <Share />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Share Dialog */}
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share PDF</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </DialogContent>
        <DialogContent>
          <Button
            onClick={handleShare}
            variant="contained"
            color="primary"
            fullWidth
          >
            Share
          </Button>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
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

export default ShareSection;
