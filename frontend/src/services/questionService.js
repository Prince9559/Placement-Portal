
import api from "./api";

const questionService = {
  async getQuestions(params = {}) {
    const response = await api.get("/questions", { params });
    return response.data;
  },

  async getQuestionById(id) {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  async createQuestion(questionData) {
    const response = await api.post("/questions", questionData);
    return response.data;
  },

  async updateQuestion(id, questionData) {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  async deleteQuestion(id) {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

export default questionService;
