
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("placement_portal_token");

    console.log("API REQUEST:", config.url);
    console.log("TOKEN EXISTS:", Boolean(token));
    console.log(
      "AUTH HEADER EXISTS:",
      Boolean(config.headers.Authorization)
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const message = error.response?.data?.message || (error.code === "ECONNABORTED"? "Request timed out. Please try again." : !error.response ? "Unable to connect to server. Please check your internet." : "Something went wrong.");

    if (status === 401) {
      localStorage.removeItem("placement_portal_token");
      localStorage.removeItem("placement_portal_user");
    }

    if (!error.config?.skipGlobalErrorToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
