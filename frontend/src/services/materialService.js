
import api from "./api";

const materialService = {
  async getMaterials(params = {}) {
    const response = await api.get("/materials", { params });
    return response.data;
  },

  async getMaterialById(id) {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  async createMaterial(materialData) {
    const response = await api.post("/materials", materialData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/materials/${id}`, materialData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  },
};

export default materialService;
