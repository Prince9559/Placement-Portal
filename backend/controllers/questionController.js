const mongoose = require("mongoose");
const Question = require("../models/Question");

const validCategories = ["aptitude", "reasoning", "verbal", "technical"];
const validDifficulties = ["easy", "medium", "hard"];

const hasValidOptions = (options) => {
  return (
    Array.isArray(options) &&
    options.length >= 2 &&
    options.every(
      (option) =>
        option &&
        typeof option.text === "string" &&
        option.text.trim().length > 0
    ) &&
    options.filter((option) => option.isCorrect === true).length === 1
  );
};

// GET ALL QUESTIONS - STUDENT
const getQuestions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    const filter = { isActive: true };

    if (req.query.category) {
      if (!validCategories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      filter.category = req.query.category;
    }

    if (req.query.difficulty) {
      if (!validDifficulties.includes(req.query.difficulty)) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty",
        });
      }
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.topic) {
      filter.topic = {
        $regex: req.query.topic,
        $options: "i",
      };
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .select("-options.isCorrect -explanation")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Question.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE QUESTION - STUDENT
const getQuestionById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await Question.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-options.isCorrect -explanation");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE QUESTION - ADMIN
const createQuestion = async (req, res) => {
  try {
    const {
      question,
      category,
      topic,
      difficulty,
      options,
      explanation,
      company,
      tags,
    } = req.body;

    if (!question || !category || !topic || !options) {
      return res.status(400).json({
        success: false,
        message: "Question, category, topic and options are required",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
      });
    }

    if (!hasValidOptions(options)) {
      return res.status(400).json({
        success: false,
        message: "Provide at least 2 options and exactly 1 correct answer",
      });
    }

    const newQuestion = await Question.create({
      question,
      category,
      topic,
      difficulty,
      options,
      explanation,
      company,
      tags,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE QUESTION - ADMIN
const updateQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const allowedFields = [
      "question",
      "category",
      "topic",
      "difficulty",
      "options",
      "explanation",
      "company",
      "tags",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (
      updates.category &&
      !validCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    if (
      updates.difficulty &&
      !validDifficulties.includes(updates.difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
      });
    }

    if (
      updates.options !== undefined &&
      !hasValidOptions(updates.options)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least 2 options and exactly 1 correct answer",
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE QUESTION - ADMIN (SOFT DELETE)
const deleteQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};