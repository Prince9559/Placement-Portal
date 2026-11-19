const mongoose = require("mongoose");
const CodingQuestion = require("../models/CodingQuestion");

const validCategories = [
  "arrays",
  "strings",
  "linked-list",
  "stack",
  "queue",
  "tree",
  "graph",
  "sorting",
  "searching",
  "dynamic-programming",
  "math",
  "other",
];

const validDifficulties = ["easy", "medium", "hard"];

const validateTestCases = (cases) => {
  return (
    Array.isArray(cases) &&
    cases.every(
      (item) =>
        item &&
        typeof item.input === "string" &&
        typeof item.output === "string"
    )
  );
};

// GET ALL CODING QUESTIONS - STUDENT
const getCodingQuestions = async (req, res) => {
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

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const [questions, total] = await Promise.all([
      CodingQuestion.find(filter)
        .select("-hiddenTestCases -createdBy")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      CodingQuestion.countDocuments(filter),
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

// GET SINGLE CODING QUESTION - STUDENT
const getCodingQuestionById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coding question ID",
      });
    }

    const question = await CodingQuestion.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-hiddenTestCases -createdBy");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Coding question not found",
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

// CREATE CODING QUESTION - ADMIN
const createCodingQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleTestCases,
      hiddenTestCases,
      hints,
      companies,
      tags,
      timeLimit,
      memoryLimit,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
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

    if (
      sampleTestCases !== undefined &&
      !validateTestCases(sampleTestCases)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sample test cases",
      });
    }

    if (
      hiddenTestCases !== undefined &&
      !validateTestCases(hiddenTestCases)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid hidden test cases",
      });
    }

    const newQuestion = await CodingQuestion.create({
      title,
      description,
      category,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleTestCases,
      hiddenTestCases,
      hints,
      companies,
      tags,
      timeLimit,
      memoryLimit,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Coding question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CODING QUESTION - ADMIN
const updateCodingQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coding question ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "difficulty",
      "constraints",
      "inputFormat",
      "outputFormat",
      "sampleTestCases",
      "hiddenTestCases",
      "hints",
      "companies",
      "tags",
      "timeLimit",
      "memoryLimit",
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
      updates.sampleTestCases !== undefined &&
      !validateTestCases(updates.sampleTestCases)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sample test cases",
      });
    }

    if (
      updates.hiddenTestCases !== undefined &&
      !validateTestCases(updates.hiddenTestCases)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid hidden test cases",
      });
    }

    const question = await CodingQuestion.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Coding question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coding question updated successfully",
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CODING QUESTION - ADMIN (SOFT DELETE)
const deleteCodingQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coding question ID",
      });
    }

    const question = await CodingQuestion.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Coding question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coding question deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCodingQuestions,
  getCodingQuestionById,
  createCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion,
};