
import api from "./api";

const TOKEN_KEY = "placement_portal_token";
const USER_KEY = "placement_portal_user";

const authService = {
  async register(userData) {
    const response = await api.post("/auth/register", userData);

    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);

    const data = response.data;
    
    const token =
      data.token ||
      data.data?.token ||
      data.data?.accessToken;

    const user =
      data.user ||
      data.data?.user;

    if (!token || !user) {
      throw new Error("Invalid login response from server.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },
};

export default authService;
