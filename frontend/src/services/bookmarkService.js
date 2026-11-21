
import api from "./api";

const bookmarkService = {
  async getMyBookmarks() {
    const response = await api.get("/bookmarks");
    return response.data;
  },

  async addBookmark(questionId) {
    const response = await api.post(`/bookmarks/${questionId}`);
    return response.data;
  },

  async removeBookmark(questionId) {
    const response = await api.delete(`/bookmarks/${questionId}`);
    return response.data;
  },
};

export default bookmarkService;
