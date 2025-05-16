import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid email format");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 6 characters long and contain both letters and numbers."
      );
      return;
    }

    if (tab === 1 && username.length < 3) {
      alert("Username must be at least 3 characters long");
      return;
    }

    try {
      if (tab === 0) {
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email, password }
        );
        alert("Login Successful!");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        await axios.post("http://localhost:5000/api/auth/register", {
          email,
          password,
          username,
        });
        alert("Registration Successful! Please log in.");
        setTab(0);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        sx={{
          width: 420,
          textAlign: "center",
          p: 4,
          borderRadius: 3,
          boxShadow: 10,
          bgcolor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Tabs value={tab} onChange={handleChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <CardContent>
          <form onSubmit={handleAuth} autoComplete="off">
            {tab === 1 && (
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FormControlLabel
              control={<Switch />}
              label="Remember me"
              sx={{ display: "block", textAlign: "left", mt: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: "1rem",
                borderRadius: 3,
                backgroundColor: "#2563EB", // Matches Download Section
                "&:hover": { backgroundColor: "#1E3A8A" },
              }}
            >
              {tab === 0 ? "Login" : "Register"}
            </Button>
          </form>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {tab === 0 ? "Don't have an account?" : "Already have an account?"}
            <a
              href="#"
              onClick={() => setTab(tab === 0 ? 1 : 0)}
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              {tab === 0 ? "Sign up" : "Login"}
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;
