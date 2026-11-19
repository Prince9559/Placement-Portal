
const mongoose = require("mongoose");
const UserProgress = require("../models/UserProgress");
const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");

 
const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await UserProgress.find({
    user: req.user._id,
  }).sort({ category: 1, topic: 1 });

  const totalTopics = progress.length;

  const totalQuestions = progress.reduce(
    (sum, item) => sum + item.totalQuestions,
    0
  );

  const attemptedQuestions = progress.reduce((sum, item) => sum + item.attemptedQuestions,0);
  const correctAnswers = progress.reduce((sum, item) => sum + item.correctAnswers,0);

  const overallAccuracy = attemptedQuestions > 0 ? Number(((correctAnswers / attemptedQuestions) * 100).toFixed(2)) : 0;

  return res.status(200).json({
    success: true,
    message: "Progress fetched successfully",
    summary: {
      totalTopics,
      totalQuestions,
      attemptedQuestions,
      correctAnswers,
      overallAccuracy,
    },
    data: progress,
  });
});

 
const recordProgress = asyncHandler(async (req, res) => {
  const { questionId, selectedOptionIndex } = req.body;

  if (!questionId || selectedOptionIndex === undefined) {
    return res.status(400).json({
      success: false,
      message: "Question ID and selected option index are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID",
    });
  }

  const optionIndex = Number(selectedOptionIndex);

  if (!Number.isInteger(optionIndex) ||optionIndex < 0) {
    return res.status(400).json({
      success: false,
      message: "Selected option index must be a valid non-negative integer",
    });
  }

  const question = await Question.findOne({
    _id: questionId,
    isActive: true,
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question not found or inactive",
    });
  }

  if (!Array.isArray(question.options) ||optionIndex >= question.options.length) {
    return res.status(400).json({
      success: false,
      message: "Selected option does not exist",
    });
  }

  const selectedOption = question.options[optionIndex];
  const isCorrect = selectedOption.isCorrect === true;

  const totalQuestions = await Question.countDocuments({
    category: question.category,
    topic: question.topic,
    isActive: true,
  });


  const progress = await UserProgress.findOneAndUpdate(
    {
      user: req.user._id,
      category: question.category,
      topic: question.topic,
    },
    {
      $set: {
        totalQuestions,
      },
      $inc: {
        attemptedQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0,
      },
      $setOnInsert: {
        user: req.user._id,
        category: question.category,
        topic: question.topic,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );


  progress.accuracy =progress.attemptedQuestions > 0? Number( ((progress.correctAnswers / progress.attemptedQuestions) *100).toFixed(2)): 0;

  await progress.save();

  return res.status(200).json({
    success: true,
    message: "Answer checked and progress updated successfully",
    result: {
      questionId: question._id,
      category: question.category,
      topic: question.topic,
      isCorrect,
    },
    data: progress,
  });
});

 
const getProgressSummary = asyncHandler(async (req, res) => {
  const progress = await UserProgress.find({ user: req.user._id,});

  const summary = progress.reduce(
    (result, item) => {
      result.totalTopics += 1;
      result.totalQuestions += item.totalQuestions;
      result.attemptedQuestions += item.attemptedQuestions;
      result.correctAnswers += item.correctAnswers;
      return result;
    },
    {
      totalTopics: 0,
      totalQuestions: 0,
      attemptedQuestions: 0,
      correctAnswers: 0,
    }
  );

  summary.overallAccuracy =
    summary.attemptedQuestions > 0 ? Number( ((summary.correctAnswers /summary.attemptedQuestions) *100).toFixed(2)): 0;

  return res.status(200).json({
    success: true,
    message: "Progress summary fetched successfully",
    data: summary,
  });
});

module.exports = {
  getMyProgress,
  recordProgress,
  getProgressSummary,
};
