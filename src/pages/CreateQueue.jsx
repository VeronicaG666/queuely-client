import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import axios from "axios";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "https://queuely-server.onrender.com/api";

function CreateQueue() {
  const [title, setTitle] = useState("");
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!title) {
      setError("❗ Queue title is required.");
      return;
    }

    if (!user?.id) {
      setError("Please login as a business before creating a queue.");
      return;
    }

    try {
      const res = await axios.post(`${API}/queue/create`, {
        title,
        business_id: user.id,
      });

      const newQueue = res.data.queue;
      setQueue(newQueue);
      setError(null);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate(`/dashboard/${newQueue.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to create queue. Please try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(queue.id);
    setCopied(true);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Create a New Queue
      </Typography>

      <Box my={2}>
        <TextField
          label="Queue Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleCreate}>
          Create Queue
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {queue && (
        <Box mt={4}>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Queue <strong>{queue.title}</strong> created! <br />
            Queue ID: <code>{queue.id}</code>
            <Button onClick={handleCopy} size="small" sx={{ ml: 2 }}>
              Copy ID
            </Button>
          </Alert>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="subtitle1">Scan to Join:</Typography>
            <QRCode
              value={`https://queuely-client.vercel.app/join?queueId=${queue.id}`}
              size={160}
            />

            <Button
              variant="outlined"
              href={`/join?queueId=${queue.id}`}
              target="_blank"
              sx={{ mt: 2 }}
            >
              Open Join Link
            </Button>
          </Box>
        </Box>
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

export default CreateQueue;
