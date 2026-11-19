
const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create notification
// @route   POST /api/notifications
// @access  Admin
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, recipient, link } = req.body;

  if (
    !title ||
    !message ||
    typeof title !== "string" ||
    typeof message !== "string" ||
    !title.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Title and message are required",
    });
  }

  if (title.trim().length > 150 || message.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Title or message exceeds the allowed length",
    });
  }

  const allowedTypes = [
    "general",
    "test",
    "study-material",
    "placement",
    "announcement",
  ];

  const notificationType = type || "general";

  if (!allowedTypes.includes(notificationType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification type",
    });
  }

  // recipient is optional. null means notification for all students.
  let recipientId = null;

  if (recipient !== undefined && recipient !== null && recipient !== "") {
    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID",
      });
    }

    const user = await User.findById(recipient).select("_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    recipientId = user._id;
  }

  if (link !== undefined && typeof link !== "string") {
    return res.status(400).json({
      success: false,
      message: "Link must be a string",
    });
  }

  const notification = await Notification.create({
    title: title.trim(),
    message: message.trim(),
    type: notificationType,
    recipient: recipientId,
    link: link ? link.trim() : "",
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

// @desc    Get logged-in student's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const filter = {
    $or: [
      { recipient: null },
      { recipient: req.user._id },
    ],
  };

  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Calculate read status separately for each student.
  const data = notifications.map((notification) => {
    const item = notification.toObject();

    if (item.recipient === null) {
      item.isRead = item.readBy.some(
        (entry) => entry.user.toString() === req.user._id.toString()
      );
    }

    // Do not expose internal read tracking data.
    delete item.readBy;

    return item;
  });

  return res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    total,
    page,
    pages: Math.ceil(total / limit),
    data,
  });
});

// @desc    Get all notifications (admin)
// @route   GET /api/notifications/admin/all
// @access  Admin
const getAllNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const total = await Notification.countDocuments();

  const notifications = await Notification.find()
    .populate("createdBy", "name email")
    .populate("recipient", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: "All notifications fetched successfully",
    total,
    page,
    pages: Math.ceil(total / limit),
    data: notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { recipient: null },
      { recipient: req.user._id },
    ],
  }).select("recipient isRead readBy");

  let unreadCount = 0;

  notifications.forEach((notification) => {
    let read = notification.isRead;

    if (notification.recipient === null) {
      read = notification.readBy.some(
        (entry) => entry.user.toString() === req.user._id.toString()
      );
    }

    if (!read) {
      unreadCount += 1;
    }
  });

  return res.status(200).json({
    success: true,
    message: "Unread notification count fetched successfully",
    unreadCount,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
    });
  }

  const notification = await Notification.findOne({
    _id: id,
    $or: [
      { recipient: null },
      { recipient: req.user._id },
    ],
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  if (notification.recipient === null) {
    // For global notifications, track read status per student.
    const alreadyRead = notification.readBy.some(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      await Notification.updateOne(
        {
          _id: notification._id,
          recipient: null,
          "readBy.user": { $ne: req.user._id },
        },
        {
          $push: {
            readBy: {
              user: req.user._id,
              readAt: new Date(),
            },
          },
        }
      );
    }
  } else if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Admin
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
    });
  }

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

module.exports = {
  createNotification,
  getMyNotifications,
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
};
