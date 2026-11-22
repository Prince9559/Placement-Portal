
import api from "./api";

const codingService = {
  async getCodingQuestions(params = {}) {
    const response = await api.get("/coding", { params });
    return response.data;
  },

  async getCodingQuestionById(id) {
    const response = await api.get(`/coding/${id}`);
    return response.data;
  },
};

export default codingService;
