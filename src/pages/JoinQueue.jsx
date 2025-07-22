import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "https://queuely-server.onrender.com/api";

function JoinQueue() {
  const [params] = useSearchParams();
  const queueId = params.get("queueId");

  const [name, setName] = useState("");
  const [queueInfo, setQueueInfo] = useState(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`${API}/queue/${queueId}`);
        setQueueInfo(res.data.queue);
      } catch (err) {
        setError("Queue not found.");
      } finally {
        setLoading(false);
      }
    };

    if (queueId) fetchQueue();
  }, [queueId]);

  const handleJoin = async () => {
    if (!name) {
      setError("Name is required to join the queue.");
      return;
    }

    try {
      await axios.post(`${API}/queue/${queueId}/join`, { name });
      setJoined(true);
      setError(null);
    } catch (err) {
      console.error("❌ Join error:", err);
      setError("Failed to join queue. Try again.");
    }
  };

  if (loading)
    return (
      <Container>
        <Box mt={5} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Join Queue
        </Typography>

        {queueInfo && (
          <Typography variant="subtitle1" gutterBottom>
            Queue: <strong>{queueInfo.title}</strong>
          </Typography>
        )}

        {joined ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            🎉 You've joined the queue successfully!
          </Alert>
        ) : (
          <Box>
            <TextField
              fullWidth
              margin="normal"
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleJoin}>
              Join Queue
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default JoinQueue;
