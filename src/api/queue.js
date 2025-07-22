// src/api/queue.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://queuely-server.onrender.com/api';

export const fetchQueue = (id) =>
  axios.get(`${BASE_URL}/queue/${id}`).then(res => res.data);

export const updateUserStatus = (queueId, userId, status) =>
  axios.patch(`${BASE_URL}/queue/${queueId}/user/${userId}`, { status });
