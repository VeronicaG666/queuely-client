import { useState, useEffect } from "react";
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

const API = "https://queuely-server.onrender.com/api";

function CreateQueue() {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!title || !email || !name) {
      setError("❗ Please fill in all fields.");
      return;
    }

    try {
      // Step 1: create or verify business
      const businessRes = await axios.post(`${API}/business/verify`, {
        name,
        email,
      });
      const business_id = businessRes.data.business.id;

      // Step 2: create queue
      const res = await axios.post(`${API}/queue/create`, {
        title,
        business_id,
      });

      setQueue(res.data.queue);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to create queue. Check your input or try again.");
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

            <Box mt={2} display="flex" gap={2}>
              <Button variant="outlined" href={`/dashboard`}>
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                href={`/join?queueId=${queue.id}`}
                target="_blank"
              >
                Open Join Link
              </Button>
            </Box>
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
