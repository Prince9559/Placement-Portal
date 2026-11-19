const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role.
router.use(protect, adminOnly);

// Admin dashboard
router.get("/dashboard", getAdminDashboard);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

module.exports = router;