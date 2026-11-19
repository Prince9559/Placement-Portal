
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "general",
        "test",
        "study-material",
        "placement",
        "announcement",
      ],
      default: "general",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readBy: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    link: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently fetch notifications for a user.
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

// Efficiently find unread notifications.
notificationSchema.index({
  recipient: 1,
  isRead: 1,
});

module.exports = mongoose.model("Notification", notificationSchema);
