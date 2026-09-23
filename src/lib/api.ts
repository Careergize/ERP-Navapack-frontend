import axios from "axios";

// Point this at your DRF backend. Injected via .env as VITE_API_BASE_URL
// so the same build can target dev/staging/prod without a code change.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("navapack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("navapack_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
