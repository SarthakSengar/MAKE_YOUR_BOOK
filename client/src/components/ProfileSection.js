import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { PhotoCamera, Save, Edit, Crop } from "@mui/icons-material";
import axios from "axios";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ProfileSection = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editMode, setEditMode] = useState({
    username: false,
    bio: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1,
  });
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setFormData({
        ...formData,
        username: response.data.username,
        bio: response.data.bio || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile data",
      });
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop) => {
    setCrop(crop);
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    setOriginalImage(null);
    setProfileImage(null);
    setImagePreview("");
  };

  const handleCropSave = () => {
    if (imageRef.current && crop.width && crop.height) {
      const canvas = document.createElement("canvas");
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          setProfileImage(croppedFile);
          setImagePreview(URL.createObjectURL(blob));
        }
      }, "image/jpeg");
    }
    setShowCropDialog(false);
    setOriginalImage(null);
  };

  const handleUpdateUsername = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/profile/username",
        { username: formData.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData({ ...userData, username: response.data.username });
      setEditMode({ ...editMode, username: false });
      setMessage({
        type: "success",
        text: "Username updated successfully",
      });
      setOpenSnackbar(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update username",
      });
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBio = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/profile/bio",
        { bio: formData.bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData({ ...userData, bio: response.data.bio });
      setEditMode({ ...editMode, bio: false });
      setMessage({
        type: "success",
        text: "Bio updated successfully",
      });
      setOpenSnackbar(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update bio",
      });
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match",
      });
      setOpenSnackbar(true);
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/profile/password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode({ ...editMode, password: false });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({
        type: "success",
        text: "Password updated successfully",
      });
      setOpenSnackbar(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update password",
      });
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", profileImage);

      const response = await axios.post(
        "http://localhost:5000/api/profile/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserData({
        ...userData,
        profileImage: response.data.profileImage,
      });
      setProfileImage(response.data.profileImage);
      setImagePreview("");
      setMessage({
        type: "success",
        text: "Profile image updated successfully",
      });
      setOpenSnackbar(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update profile image",
      });
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          Profile Settings
        </Typography>

        {/* Profile Image Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Avatar
            src={
              profileImage ||
              (userData?.profileImage ? userData.profileImage : "")
            }
            sx={{ width: 150, height: 150, mb: 2 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={saving}
            >
              Choose Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {profileImage && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadProfileImage}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                Upload
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Username Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Username</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            {editMode.username ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  onClick={handleUpdateUsername}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditMode({ ...editMode, username: false });
                    setFormData({
                      ...formData,
                      username: userData.username,
                    });
                  }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">{userData.username}</Typography>
                <IconButton
                  onClick={() => setEditMode({ ...editMode, username: true })}
                >
                  <Edit />
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Bio Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Bio</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            {editMode.bio ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateBio}
                    disabled={saving}
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditMode({ ...editMode, bio: false });
                      setFormData({
                        ...formData,
                        bio: userData.bio || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Typography variant="body1">
                  {userData.bio || "No bio added yet"}
                </Typography>
                <IconButton
                  onClick={() => setEditMode({ ...editMode, bio: true })}
                >
                  <Edit />
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Password Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Password</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            {editMode.password ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditMode({ ...editMode, password: false });
                      setFormData({
                        ...formData,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">********</Typography>
                <IconButton
                  onClick={() => setEditMode({ ...editMode, password: true })}
                >
                  <Edit />
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Crop Dialog */}
      <Dialog
        open={showCropDialog}
        onClose={handleCropCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crop Profile Image</DialogTitle>
        <DialogContent>
          {originalImage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <ReactCrop
                src={originalImage}
                onChange={handleCropComplete}
                crop={crop}
                circularCrop
                aspect={1}
              >
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="Crop preview"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              </ReactCrop>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCropCancel}>Cancel</Button>
          <Button onClick={handleCropSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={message.type}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSection;
