import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://queuely-server.onrender.com/api";

function Login() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !name) {
      setError("Both name and email are required.");
      return;
    }

    try {
      const res = await axios.post(`${API}/business/verify`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      const business = res.data.business;
      localStorage.setItem("queuely_business", JSON.stringify(business));
      setError(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Login failed. Check your info or try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={6}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            🔐 Business Login
          </Typography>

          <TextField
            label="Business Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Business Email"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Login to Dashboard
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
