
const mongoose = require("mongoose");

const Bookmark = require("../models/Bookmark");
const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get logged-in student's bookmarks
// @route   GET /api/bookmarks
// @access  Private

const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({
    user: req.user._id,
  })
    .populate({
      path: "question",
      match: { isActive: true },
      select: "question category topic difficulty options explanation companies tags",
    })
    .sort({ createdAt: -1 });

  const activeBookmarks = bookmarks
    .filter((bookmark) => bookmark.question !== null)
    .map((bookmark) => {
      const item = bookmark.toObject();

      // Remove correct-answer information from every option.
      item.question.options = item.question.options.map((option) => ({
        _id: option._id,
        text: option.text,
      }));

      // Never expose the explanation in the bookmark list.
      delete item.question.explanation;

      return item;
    });

  return res.status(200).json({
    success: true,
    message: "Bookmarks fetched successfully",
    total: activeBookmarks.length,
    data: activeBookmarks,
  });
});


// @desc    Add a question to bookmarks
// @route   POST /api/bookmarks/:questionId
// @access  Private
const addBookmark = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID",
    });
  }

  const question = await Question.findOne({
    _id: questionId,
    isActive: true,
  }).select("_id");

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question not found or inactive",
    });
  }

  const existingBookmark = await Bookmark.findOne({
    user: req.user._id,
    question: questionId,
  });

  if (existingBookmark) {
    return res.status(409).json({
      success: false,
      message: "Question is already bookmarked",
    });
  }

  try {
    const bookmark = await Bookmark.create({
      user: req.user._id,
      question: questionId,
    });

    return res.status(201).json({
      success: true,
      message: "Question bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    // Handles simultaneous duplicate requests using the unique index.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Question is already bookmarked",
      });
    }

    throw error;
  }
});

// @desc    Remove a question from bookmarks
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
const removeBookmark = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID",
    });
  }

  const bookmark = await Bookmark.findOneAndDelete({
    user: req.user._id,
    question: questionId,
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      message: "Bookmark not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Bookmark removed successfully",
  });
});

module.exports = {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
};
