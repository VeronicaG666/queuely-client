import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import ReplayIcon from "@mui/icons-material/Replay";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const API = "https://queuely-server.onrender.com/api";
const SOCKET = "https://queuely-server.onrender.com";

function BusinessDashboard() {
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [usersByQueue, setUsersByQueue] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setError("Login required.");
      setLoading(false);
      return;
    }

    const fetchQueues = async () => {
      try {
        const res = await axios.get(`${API}/business/${user.id}/queues`);
        setQueues(res.data.queues);
        setError(null);
      } catch (err) {
        setError("Failed to load queues.");
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, [user]);

  useEffect(() => {
    const socket = io(SOCKET);

    queues.forEach((queue) => {
      socket.emit("join_queue_room", queue.id);
    });

    socket.on("queueUpdated", (data) => {
      if (data?.event === "user_joined" && data.queue_id) {
        setUsersByQueue((prev) => ({
          ...prev,
          [data.queue_id]: [...(prev[data.queue_id] || []), data.user],
        }));
      }
    });

    return () => socket.disconnect();
  }, [queues]);

  const fetchUsers = async (queueId) => {
    try {
      const res = await axios.get(`${API}/queue/${queueId}`);
      setUsersByQueue((prev) => ({
        ...prev,
        [queueId]: res.data.users,
      }));
    } catch (err) {
      console.error(`Error fetching users for queue ${queueId}`, err);
    }
  };

  const updateStatus = async (queueId, userId, newStatus) => {
    try {
      await axios.patch(`${API}/queue/${queueId}/user/${userId}`, {
        status: newStatus,
      });

      setUsersByQueue((prev) => ({
        ...prev,
        [queueId]: prev[queueId].map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        ),
      }));
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  const exportCSV = (queueId) => {
    window.open(`${API}/queue/${queueId}/export`, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "default";
      case "served":
        return "success";
      case "skipped":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Your Queues
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {queues.length === 0 ? (
          <Alert severity="info">You haven't created any queues yet.</Alert>
        ) : (
          queues.map((queue) => (
            <Accordion key={queue.id} onChange={() => fetchUsers(queue.id)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="bold">
                  {queue.title} — {queue.status}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mb={2}>
                  <Button
                    variant="outlined"
                    onClick={() => exportCSV(queue.id)}
                  >
                    Export CSV
                  </Button>
                </Box>
                {usersByQueue[queue.id]?.length > 0 ? (
                  <List>
                    {usersByQueue[queue.id].map((user) => (
                      <ListItem
                        key={user.id}
                        secondaryAction={
                          <Box>
                            <IconButton
                              onClick={() =>
                                updateStatus(queue.id, user.id, "served")
                              }
                              title="Mark as Served"
                            >
                              <CheckIcon color="success" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                updateStatus(queue.id, user.id, "skipped")
                              }
                              title="Skip"
                            >
                              <ClearIcon color="error" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                updateStatus(queue.id, user.id, "waiting")
                              }
                              title="Reset to Waiting"
                            >
                              <ReplayIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={user.name}
                          secondary={
                            <Chip
                              label={user.status}
                              color={getStatusColor(user.status)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No users in this queue yet.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Container>
  );
}

export default BusinessDashboard;
