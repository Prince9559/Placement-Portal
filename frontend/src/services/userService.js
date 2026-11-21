import api from "./api";

const userService = {
  async getAllUsers(params = {}) {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id, isActive) {
    const response = await api.patch(`/admin/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },
};

export default userService;