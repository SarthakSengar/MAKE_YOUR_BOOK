import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Drawer,
  ListItemIcon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UploadSection from "./UploadSection";
import DownloadSection from "./DownloadSection";
import MyFilesSection from "./MyFilesSection";
import ShareSection from "./ShareSection";
import ProfileSection from "./ProfileSection";
import PersonIcon from "@mui/icons-material/Person";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [selectedSection, setSelectedSection] = useState("upload");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e1e, #3c3c3c)", // Dark theme gradient
        color: "#ffffff",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            background: "#121212",
            color: "#ffffff",
            boxShadow: "2px 0px 10px rgba(0,0,0,0.3)",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem
            button
            onClick={() => setSelectedSection("upload")}
            sx={{
              "&:hover": { background: "#333" },
              background: selectedSection === "upload" ? "#444" : "inherit",
            }}
          >
            <ListItemText primary="Upload PDF" />
          </ListItem>
          <ListItem
            button
            onClick={() => setSelectedSection("download")}
            sx={{
              "&:hover": { background: "#333" },
              background: selectedSection === "download" ? "#444" : "inherit",
            }}
          >
            <ListItemText primary="Download PDF" />
          </ListItem>
          <ListItem
            button
            onClick={() => setSelectedSection("myfiles")}
            sx={{
              "&:hover": { background: "#333" },
              background: selectedSection === "myfiles" ? "#444" : "inherit",
            }}
          >
            <ListItemText primary="My Files" />
          </ListItem>
          <ListItem
            button
            onClick={() => setSelectedSection("share")}
            sx={{
              "&:hover": { background: "#333" },
              background: selectedSection === "share" ? "#444" : "inherit",
            }}
          >
            <ListItemText primary="Share PDFs" />
          </ListItem>
          <ListItem
            button
            onClick={() => setSelectedSection("profile")}
            selected={selectedSection === "profile"}
          >
            <ListItemText primary="Manage Profile" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <AppBar
          position="fixed"
          sx={{
            background: "linear-gradient(90deg, #222, #444)",
            boxShadow: "none",
            zIndex: 1201,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              MakeYourBook
            </Typography>

            {userData && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={userData.profileImage ? `${userData.profileImage}` : ""}
                  alt={userData.username}
                  sx={{ width: 40, height: 40 }}
                />
                <Typography variant="h6">{userData.username}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Content Section */}
        <Box sx={{ flexGrow: 1, padding: "60px 0px 0px 0px" }}>
          {selectedSection === "upload" && (
            <UploadSection userId={userData?.id} />
          )}
          {selectedSection === "download" && <DownloadSection />}
          {selectedSection === "myfiles" && <MyFilesSection />}
          {selectedSection === "share" && <ShareSection />}
          {selectedSection === "profile" && <ProfileSection />}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
