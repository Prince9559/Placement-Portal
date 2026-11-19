const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {getAdminDashboard,getAllUsers,getUserById,updateUserStatus,updateUserRole,} = require("../controllers/adminController");
router.use(protect, adminOnly);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

module.exports = router;