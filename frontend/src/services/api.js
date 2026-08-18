import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== ""
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access");
    }

    return Promise.reject(error);
  }
);

export default API;