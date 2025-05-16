const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Multer storage configuration for profile images (no need to store locally anymore)
const storage = multer.memoryStorage(); // Store image in memory

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// Get user profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update username
router.put("/username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ msg: "Username must be at least 3 characters long" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.username = username;
    await user.save();

    res.json({ msg: "Username updated successfully", username: user.username });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update bio
router.put("/bio", authMiddleware, async (req, res) => {
  try {
    const { bio } = req.body;

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.bio = bio;
    await user.save();

    res.json({ msg: "Bio updated successfully", bio: user.bio });
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update password
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Please provide both current and new password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Upload profile image
router.post(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No image file uploaded" });
      }

      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Upload to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { folder: "profile-images" }, // Optional: Folder where the image will be stored
          async (error, result) => {
            if (error) {
              return res
                .status(500)
                .json({ msg: "Error uploading image to Cloudinary" });
            }

            // Delete old profile image if exists
            if (user.profileImage) {
              const oldImageUrl = user.profileImage
                .split("/")
                .pop()
                .split(".")[0];
              cloudinary.uploader.destroy(oldImageUrl, (error, result) => {
                if (error) {
                  console.error(
                    "Error deleting old image from Cloudinary",
                    error
                  );
                }
              });
            }

            // Update the profile image URL in the user document
            user.profileImage = result.secure_url; // Cloudinary URL
            await user.save();

            res.json({
              msg: "Profile image updated successfully",
              profileImage: user.profileImage,
            });
          }
        )
        .end(req.file.buffer); // Pass image buffer from Multer to Cloudinary
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
