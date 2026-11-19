
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

// Student routes
router.get("/", protect, getMaterials);
router.get("/:id", protect, getMaterialById);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("file"),
  createMaterial
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("file"),
  updateMaterial
);

router.delete("/:id", protect, adminOnly, deleteMaterial);

module.exports = router;
