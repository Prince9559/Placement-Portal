const mongoose = require("mongoose");

const User = require("../models/User");
const Question = require("../models/Question");
const CodingQuestion = require("../models/CodingQuestion");
const InterviewQuestion = require("../models/InterviewQuestion");
const Test = require("../models/Test");
const TestAttempt = require("../models/TestAttempt");
const Result = require("../models/Result");
const StudyMaterial = require("../models/StudyMaterial");
const Notification = require("../models/Notification");
const Bookmark = require("../models/Bookmark");
const UserProgress = require("../models/UserProgress");

const asyncHandler = require("../utils/asyncHandler");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalStudents,
    totalAdmins,
    totalQuestions,
    totalCodingQuestions,
    totalInterviewQuestions,
    totalTests,
    activeTests,
    completedAttempts,
    totalResults,
    totalMaterials,
    totalNotifications,
    totalBookmarks,
    totalProgressRecords,
    resultStats,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "admin" }),
    Question.countDocuments(),
    CodingQuestion.countDocuments(),
    InterviewQuestion.countDocuments(),
    Test.countDocuments(),
    Test.countDocuments({ isActive: true }),
    TestAttempt.countDocuments({ status: "completed" }),
    Result.countDocuments(),
    StudyMaterial.countDocuments(),
    Notification.countDocuments(),
    Bookmark.countDocuments(),
    UserProgress.countDocuments(),
    Result.aggregate([
      {
        $group: {
          _id: null,
          averagePercentage: { $avg: "$percentage" },
          highestPercentage: { $max: "$percentage" },
        },
      },
    ]),
  ]);

  const averagePercentage = resultStats[0]?.averagePercentage || 0;
  const highestPercentage = resultStats[0]?.highestPercentage || 0;

  return res.status(200).json({
    success: true,
    message: "Admin dashboard fetched successfully",
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        students: totalStudents,
        admins: totalAdmins,
      },
      questions: {
        aptitudeAndOther: totalQuestions,
        coding: totalCodingQuestions,
        interview: totalInterviewQuestions,
        total:
          totalQuestions + totalCodingQuestions + totalInterviewQuestions,
      },
      tests: {
        total: totalTests,
        active: activeTests,
        completedAttempts,
      },
      results: {
        total: totalResults,
        averagePercentage: Number(averagePercentage.toFixed(2)),
        highestPercentage: Number(highestPercentage.toFixed(2)),
      },
      studyMaterials: totalMaterials,
      notifications: totalNotifications,
      bookmarks: totalBookmarks,
      progressRecords: totalProgressRecords,
    },
  });
});

// 2. GET ALL USERS WITH SEARCH, FILTER AND PAGINATION
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.role) {
    if (!["student", "admin"].includes(req.query.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter",
      });
    }

    filter.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    filter.isActive = req.query.isActive === "true";
  }

  if (req.query.search) {
    const search = escapeRegex(req.query.search.trim());

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// 3. GET SINGLE USER
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

// 4. ACTIVATE OR DEACTIVATE USER
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be a boolean value",
    });
  }

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own account status",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.isActive = isActive;
  await user.save();

  return res.status(200).json({
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

// 5. CHANGE USER ROLE
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  if (!["student", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be either student or admin",
    });
  }

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.role = role;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};