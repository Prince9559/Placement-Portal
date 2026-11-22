
import api from "./api";

const interviewService = {
  async getQuestions(params = {}) {
    const response = await api.get("/interview", { params });
    return response.data;
  },

  async getQuestionById(id) {
    const response = await api.get(`/interview/${id}`);
    return response.data;
  },

  async getAnswer(id) {
    const response = await api.get(`/interview/${id}/answer`);
    return response.data;
  },
};

export default interviewService;
