
const Result = require("../models/Result");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get logged-in student's result history
// @route   GET /api/results/my-results
// @access  Private
const getMyResults = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  if (req.query.passed === "true") filter.passed = true;
  if (req.query.passed === "false") filter.passed = false;

  const [results, total] = await Promise.all([
    Result.find(filter)
      .populate("test", "title category durationMinutes")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    results,
  });
});

// @desc    Get logged-in student's result details
// @route   GET /api/results/my-results/:id
// @access  Private
const getMyResultById = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("test", "title category durationMinutes");

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Result not found",
    });
  }

  res.status(200).json({
    success: true,
    result,
  });
});

// @desc    Get all students' results (Admin)
// @route   GET /api/results
// @access  Admin
const getAllResults = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.user) filter.user = req.query.user;
  if (req.query.test) filter.test = req.query.test;
  if (req.query.passed === "true") filter.passed = true;
  if (req.query.passed === "false") filter.passed = false;

  const [results, total] = await Promise.all([
    Result.find(filter)
      .populate("user", "name email college course")
      .populate("test", "title category durationMinutes")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    results,
  });
});

// @desc    Get any student's result details (Admin)
// @route   GET /api/results/:id
// @access  Admin
const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate("user", "name email college course")
    .populate("test", "title category durationMinutes");

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Result not found",
    });
  }

  res.status(200).json({
    success: true,
    result,
  });
});

// @desc    Get student's performance statistics
// @route   GET /api/results/my-stats
// @access  Private
const getMyResultStats = asyncHandler(async (req, res) => {
  const stats = await Result.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalTests: { $sum: 1 },
        averagePercentage: { $avg: "$percentage" },
        highestPercentage: { $max: "$percentage" },
        totalCorrectAnswers: { $sum: "$correctAnswers" },
        totalWrongAnswers: { $sum: "$wrongAnswers" },
        passedTests: {
          $sum: { $cond: ["$passed", 1, 0] },
        },
        failedTests: {
          $sum: { $cond: ["$passed", 0, 1] },
        },
      },
    },
  ]);

  const data = stats[0] || {
    totalTests: 0,
    averagePercentage: 0,
    highestPercentage: 0,
    totalCorrectAnswers: 0,
    totalWrongAnswers: 0,
    passedTests: 0,
    failedTests: 0,
  };

  delete data._id;
  
  data.averagePercentage = Number(
    data.averagePercentage.toFixed(2)
  );

  res.status(200).json({
    success: true,
    stats: data,
  });
});

module.exports = {
  getMyResults,
  getMyResultById,
  getAllResults,
  getResultById,
  getMyResultStats,
};
