import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { io } from "socket.io-client";

const API = "https://queuely-server.onrender.com/api";
const SOCKET_URL = "https://queuely-server.onrender.com/";

const socket = io(SOCKET_URL, { autoConnect: false });

function BusinessDashboard() {
  const [queueId, setQueueId] = useState("");
  const [users, setUsers] = useState([]);
  const [queueTitle, setQueueTitle] = useState("");
  const [fetched, setFetched] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchQueueUsers = async () => {
    if (!queueId || fetched) return;

    try {
      const res = await axios.get(`${API}/queue/${queueId}`);
      setUsers(res.data.users);
      setQueueTitle(res.data.queue.title);
      setFetched(true);
      setStatusMsg(null);

      // Connect socket and join room
      if (!socket.connected) {
        socket.connect();
        socket.emit("join_queue_room", queueId);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to fetch queue. Make sure the ID is valid.");
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      await axios.patch(`${API}/queue/${queueId}/user/${userId}`, {
        status,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status } : u))
      );
    } catch (err) {
      console.error(err);
      setStatusMsg("⚠️ Failed to update status.");
    }
  };

  useEffect(() => {
    if (!queueId) return;

    socket.on("queueUpdated", (data) => {
      if (data.queue_id === queueId && data.event === "user_joined") {
        setUsers((prev) => [...prev, data.user]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queueId]);

  const handleExportCSV = () => {
    if (queueId) {
      window.open(`${API}/queue/${queueId}/export`, "_blank");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Business Dashboard
      </Typography>

      <Box display="flex" gap={2} my={2}>
        <TextField
          label="Queue ID"
          value={queueId}
          onChange={(e) => {
            setQueueId(e.target.value);
            setFetched(false);
            setUsers([]);
            setQueueTitle("");
          }}
          fullWidth
        />
        <Button variant="contained" onClick={fetchQueueUsers}>
          Load Queue
        </Button>
      </Box>

      {statusMsg && (
        <Alert severity="error" sx={{ my: 2 }}>
          {statusMsg}
        </Alert>
      )}

      {fetched && (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
            mb={1}
          >
            <Typography variant="h6">
              Queue: {queueTitle || "Untitled"}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              sx={{ textTransform: "none" }}
            >
              Download CSV Report
            </Button>
          </Box>

          <List>
            {users.map((user) => (
              <ListItem key={user.id}>
                <ListItemText
                  primary={user.name}
                  secondary={`Status: ${user.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="success"
                    onClick={() => updateStatus(user.id, "served")}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => updateStatus(user.id, "skipped")}
                  >
                    <ClearIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}

export default BusinessDashboard;
