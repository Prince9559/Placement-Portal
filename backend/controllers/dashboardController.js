
const TestAttempt = require("../models/TestAttempt");
const UserProgress = require("../models/UserProgress");
const Bookmark = require("../models/Bookmark");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalTests = await TestAttempt.countDocuments({user: userId, status: "completed",});
    const testResults = await TestAttempt.find({user: userId, status: "completed",}).sort({ createdAt: -1 });

    const averageScore =testResults.length > 0 ? (
            testResults.reduce((total, attempt) => total + (attempt.percentage || 0), 0 ) / testResults.length).toFixed(2): 0;


    const totalBookmarks = await Bookmark.countDocuments({
      user: userId,
    });

     
    const progress = await UserProgress.find({user: userId,});

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
