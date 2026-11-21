
import api from "./api";

const progressService = {
  async getMyProgress() {
    const response = await api.get("/progress");
    return response.data;
  },

  async getProgressSummary() {
    const response = await api.get("/progress/summary");
    return response.data;
  },

  async recordProgress(progressData) {
    const response = await api.post("/progress/record", progressData);
    return response.data;
  },
};

export default progressService;
