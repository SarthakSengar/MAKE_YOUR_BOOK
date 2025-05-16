import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff, Delete } from "@mui/icons-material";

const MyFilesSection = () => {
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    fetchUserPdfs();
  }, []);

  const fetchUserPdfs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/myfiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPdfs(res.data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  const toggleVisibility = async (id, isPublic) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/myfiles/update-visibility/${id}`,
        { isPublic: !isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Instant UI update
      setPdfs((prev) =>
        prev.map((pdf) =>
          pdf._id === id ? { ...pdf, isPublic: !isPublic } : pdf
        )
      );
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const deletePdf = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/myfiles/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Remove deleted item instantly from UI
      setPdfs((prev) => prev.filter((pdf) => pdf._id !== id));
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
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
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          maxWidth: "900px",
          width: "100%",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: 3,
          boxShadow: 4,
          mt: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3} color="#1E3A8A">
          My Uploaded PDFs
        </Typography>

        {pdfs.length === 0 ? (
          <Typography textAlign="center" color="gray" mt={3}>
            No PDFs uploaded yet.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 400, borderRadius: 2 }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>Book Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Topic</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Visibility</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pdfs.map((pdf) => (
                  <TableRow key={pdf._id} hover>
                    <TableCell>{pdf.bookName}</TableCell>
                    <TableCell>{pdf.topic}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => toggleVisibility(pdf._id, pdf.isPublic)}
                        sx={{
                          color: pdf.isPublic ? "green" : "gray",
                          transition: "0.3s",
                          "&:hover": {
                            color: pdf.isPublic ? "darkgreen" : "black",
                          },
                        }}
                      >
                        {pdf.isPublic ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => deletePdf(pdf._id)}
                        sx={{
                          color: "red",
                          transition: "0.3s",
                          "&:hover": { color: "darkred" },
                        }}
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
      </Box>
    </Box>
  );
};

export default MyFilesSection;
