import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name || !email) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const res = await axios.post(`${API}/business/verify`, {
        name,
        email,
      });

      const businessId = res.data.business.id;

      navigate(`/dashboard?businessId=${businessId}`);
    } catch (err) {
      console.error(err);
      setError("Business login failed.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Business Login
      </Typography>

      <Box my={2}>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

export default Login;
