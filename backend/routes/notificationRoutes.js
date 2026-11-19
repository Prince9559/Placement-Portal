
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {createNotification,getMyNotifications,getAllNotifications,getUnreadCount,markAsRead,deleteNotification,} = require("../controllers/notificationController");
router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/:id/read", protect, markAsRead);
router.get("/admin/all", protect, adminOnly, getAllNotifications);
router.post("/", protect, adminOnly, createNotification);
router.delete("/:id", protect, adminOnly, deleteNotification);

module.exports = router;
