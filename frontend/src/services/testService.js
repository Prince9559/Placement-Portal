import api from "./api";

const testService = {
  // Get all active tests
  async getTests(params = {}) {
    const response = await api.get("/tests", { params });
    return response.data;
  },

  // Get one test's details
  async getTestById(id) {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  // Start or resume a test
  async startTest(id) {
    const response = await api.post(`/tests/${id}/start`);
    return response.data;
  },

  // Submit test answers
  async submitTest(attemptId, answers) {
    const response = await api.post(
      `/tests/attempts/${attemptId}/submit`,
      { answers }
    );
    return response.data;
  },

  // Get logged-in student's results
  async getMyResults() {
    const response = await api.get("/tests/my-results");
    return response.data;
  },

  // Get one result
  async getMyResultById(id) {
    const response = await api.get(`/tests/my-results/${id}`);
    return response.data;
  },
};

export default testService;