import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const API = "http://localhost:5000/api";

function JoinQueue() {
  const [searchParams] = useSearchParams();
  const [queueId, setQueueId] = useState(searchParams.get("queueId") || "");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleJoin = async () => {
    if (!queueId || !name) {
      setError("❗ Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post(`${API}/queue/${queueId}/join`, {
        name,
        notify_email: "", // Optional
      });

      if (res.status === 201) {
        setJoined(true);
        setError(null);
      }
    } catch (err) {
      console.error("Join error:", err);

      if (err.response?.status === 409) {
        setError("⚠️ You’ve already joined this queue.");
      } else if (err.response?.status === 404) {
        setError("❌ Queue not found.");
      } else {
        setError("❌ Failed to join queue. Try again.");
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(queueId);
    setCopied(true);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Join a Queue
      </Typography>

      <Box my={2}>
        <TextField
          label="Queue ID"
          fullWidth
          margin="normal"
          value={queueId}
          onChange={(e) => setQueueId(e.target.value)}
        />
        <TextField
          label="Your Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" onClick={handleJoin}>
            Join
          </Button>
          <Button variant="outlined" onClick={handleCopy}>
            Copy Queue ID
          </Button>
        </Box>
      </Box>

      {joined && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ You’ve joined the queue successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="📋 Queue ID copied to clipboard!"
      />
    </Container>
  );
}

export default JoinQueue;
