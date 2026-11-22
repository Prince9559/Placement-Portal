import api from "./api";

const testService = {
  async getTests(params = {}) {
    const response = await api.get("/tests", { params });
    return response.data;
  },

  async getTestById(id) {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  async startTest(id) {
    const response = await api.post(`/tests/${id}/start`);
    return response.data;
  },
  async submitTest(attemptId, answers) {
    const response = await api.post(
      `/tests/attempts/${attemptId}/submit`,
      { answers }
    );
    return response.data;
  },

  async getMyResults() {
    const response = await api.get("/tests/my-results");
    return response.data;
  },

  async getMyResultById(id) {
    const response = await api.get(`/tests/my-results/${id}`);
    return response.data;
  },
};

export default testService;