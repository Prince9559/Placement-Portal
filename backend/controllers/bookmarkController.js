
const mongoose = require("mongoose");

const Bookmark = require("../models/Bookmark");
const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");

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

       item.question.options = item.question.options.map((option) => ({
        _id: option._id,
        text: option.text,
      }));

       
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
     
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Question is already bookmarked",
      });
    }

    throw error;
  }
});


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
