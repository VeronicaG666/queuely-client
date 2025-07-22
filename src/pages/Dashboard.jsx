import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const API_BASE = "https://queuely-server.onrender.com";
const socket = io(API_BASE);

function Dashboard() {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const business = JSON.parse(localStorage.getItem("queuely_business"));

  useEffect(() => {
    if (!business) {
      navigate("/login");
      return;
    }

    fetchQueue();

    socket.emit("join_queue_room", queueId);

    socket.on("queueUpdated", (data) => {
      if (data.queue_id === queueId) {
        fetchQueue();
      }
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, [queueId]);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/queue/${queueId}`);
      setQueue(res.data.queue);
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      setError("❌ Failed to load queue data.");
      setLoading(false);
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      await axios.patch(`${API_BASE}/api/queue/${queueId}/user/${userId}`, {
        status,
      });
    } catch (err) {
      alert("❌ Failed to update user status.");
    }
  };

  const exportCSV = () => {
    window.open(`${API_BASE}/api/queue/${queueId}/export`, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("queuely_business");
    navigate("/login");
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading dashboard...</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h2>📋 Queue: {queue.title}</h2>
        <p>
          Logged in as: <strong>{business.name}</strong> (
          {business.email})
        </p>
        <button onClick={exportCSV}>⬇️ Export CSV</button>
        <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
          🔓 Logout
        </button>
      </div>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4">No users in queue yet.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.status}</td>
                <td>{new Date(user.joined_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => updateStatus(user.id, "served")}>
                    ✅ Serve
                  </button>
                  <button onClick={() => updateStatus(user.id, "skipped")}>
                    ⏭️ Skip
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
