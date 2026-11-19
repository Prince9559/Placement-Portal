const mongoose = require("mongoose");
const InterviewQuestion = require("../models/InterviewQuestion");

const validCategories = [
  "technical",
  "hr",
  "behavioral",
  "managerial",
];

const validDifficulties = ["easy", "medium", "hard"];

// GET ALL INTERVIEW QUESTIONS - STUDENT
const getInterviewQuestions = async (req, res) => {
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
      InterviewQuestion.find(filter)
        .select("-answer -sampleAnswer -createdBy")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      InterviewQuestion.countDocuments(filter),
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

// GET SINGLE INTERVIEW QUESTION - STUDENT
const getInterviewQuestionById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview question ID",
      });
    }

    const question = await InterviewQuestion.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-answer -sampleAnswer -createdBy");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found",
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

// GET INTERVIEW ANSWER - STUDENT
const getInterviewAnswer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview question ID",
      });
    }

    const question = await InterviewQuestion.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("question answer sampleAnswer tips");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found",
      });
    }

    return res.status(200).json({
      success: true,
      answer: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE INTERVIEW QUESTION - ADMIN
const createInterviewQuestion = async (req, res) => {
  try {
    const {
      question,
      category,
      topic,
      difficulty,
      answer,
      tips,
      sampleAnswer,
      companies,
      tags,
    } = req.body;

    if (!question || !category || !topic || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question, category, topic and answer are required",
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

    const newQuestion = await InterviewQuestion.create({
      question,
      category,
      topic,
      difficulty,
      answer,
      tips,
      sampleAnswer,
      companies,
      tags,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Interview question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE INTERVIEW QUESTION - ADMIN
const updateInterviewQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview question ID",
      });
    }

    const allowedFields = [
      "question",
      "category",
      "topic",
      "difficulty",
      "answer",
      "tips",
      "sampleAnswer",
      "companies",
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

    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview question updated successfully",
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE INTERVIEW QUESTION - ADMIN (SOFT DELETE)
const deleteInterviewQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview question ID",
      });
    }

    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview question deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getInterviewQuestions,
  getInterviewQuestionById,
  getInterviewAnswer,
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
};