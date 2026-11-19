
const TestAttempt = require("../models/TestAttempt");
const UserProgress = require("../models/UserProgress");
const Bookmark = require("../models/Bookmark");


console.log("TestAttempt type:", typeof TestAttempt);
console.log("TestAttempt value:", TestAttempt);
console.log(
  "TestAttempt.countDocuments type:",
  typeof TestAttempt.countDocuments
);

// GET STUDENT DASHBOARD
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total completed tests
    const totalTests = await TestAttempt.countDocuments({
      user: userId,
      status: "completed",
    });

    // Test results
    const testResults = await TestAttempt.find({
      user: userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    // Average score
    const averageScore =
      testResults.length > 0
        ? (
            testResults.reduce(
              (total, attempt) => total + (attempt.percentage || 0),
              0
            ) / testResults.length
          ).toFixed(2)
        : 0;

    // Bookmarks count
    const totalBookmarks = await Bookmark.countDocuments({
      user: userId,
    });

    // User progress
    const progress = await UserProgress.find({
      user: userId,
    });

    res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",

      dashboard: {
        totalTests,
        averageScore: Number(averageScore),
        totalBookmarks,
        recentResults: testResults.slice(0, 5),
        progress,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getDashboard };
