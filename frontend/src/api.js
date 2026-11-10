import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-career-coach-2a65.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;