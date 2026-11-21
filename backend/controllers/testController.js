
const mongoose = require("mongoose");
const Test = require("../models/Test");
const TestAttempt = require("../models/TestAttempt");
const Result = require("../models/Result");

const validCategories = [
  "aptitude",
  "reasoning",
  "verbal",
  "technical",
  "mixed",
];

// Calculate total marks
const calculateTotalMarks = (questions) =>
  questions.reduce((total, question) => total + question.marks, 0);

// Validate test questions
const validateQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one question is required";
  }

  for (const question of questions) {
    if (
      !question.question ||
      typeof question.question !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      !question.options.every(
        (option) => typeof option === "string" && option.trim()
      ) ||
      !Number.isInteger(question.correctOptionIndex) ||
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex >= question.options.length ||
      !Number.isInteger(question.marks) ||
      question.marks < 1
    ) {
      return "Each question needs valid text, at least 2 options, a valid correctOptionIndex and positive marks";
    }
  }

  return null;
};

// ADMIN: CREATE TEST
const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      durationMinutes,
      passingMarks,
      questions,
    } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !category ||
      !durationMinutes
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, category and duration are required",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test category",
      });
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive whole number",
      });
    }

    const questionError = validateQuestions(questions);

    if (questionError) {
      return res.status(400).json({
        success: false,
        message: questionError,
      });
    }

    const totalMarks = calculateTotalMarks(questions);

    const finalPassingMarks =
      passingMarks === undefined
        ? Math.ceil(totalMarks * 0.4)
        : passingMarks;

    if (
      !Number.isInteger(finalPassingMarks) ||
      finalPassingMarks < 0 ||
      finalPassingMarks > totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing marks must be a whole number between 0 and total marks",
      });
    }

    const test = await Test.create({
      title: title.trim(),
      description,
      category,
      durationMinutes,
      passingMarks: finalPassingMarks,
      questions,
      totalMarks,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Test created successfully",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: GET ALL ACTIVE TESTS
const getTests = async (req, res) => {
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
          message: "Invalid test category",
        });
      }

      filter.category = req.query.category;
    }

    const [tests, total] = await Promise.all([
      Test.find(filter)
        .select("-questions -createdBy")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Test.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      tests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: GET SINGLE TEST WITHOUT CORRECT ANSWERS
const getTestById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .select("-createdBy")
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Remove correct answers from every question
    test.questions = test.questions.map((question) => {
      const { correctOptionIndex, ...safeQuestion } = question;
      return safeQuestion;
    });

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN: UPDATE TEST
const updateTest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "durationMinutes",
      "passingMarks",
      "questions",
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
        message: "No valid fields provided",
      });
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid title is required",
      });
    }

    if (
      updates.category !== undefined &&
      !validCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid test category",
      });
    }

    if (
      updates.durationMinutes !== undefined &&
      (!Number.isInteger(updates.durationMinutes) ||
        updates.durationMinutes < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive whole number",
      });
    }

    if (updates.questions !== undefined) {
      const questionError = validateQuestions(updates.questions);

      if (questionError) {
        return res.status(400).json({
          success: false,
          message: questionError,
        });
      }

      updates.totalMarks = calculateTotalMarks(updates.questions);
    }

    const currentTest = await Test.findById(req.params.id);

    if (!currentTest) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const finalTotalMarks =
      updates.totalMarks !== undefined
        ? updates.totalMarks
        : currentTest.totalMarks;

    const finalPassingMarks =
      updates.passingMarks !== undefined
        ? updates.passingMarks
        : currentTest.passingMarks;

    if (
      !Number.isInteger(finalPassingMarks) ||
      finalPassingMarks < 0 ||
      finalPassingMarks > finalTotalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing marks must be between 0 and total marks",
      });
    }

    updates.passingMarks = finalPassingMarks;

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN: SOFT DELETE TEST
const deleteTest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: START TEST
const startTest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const existingAttempt = await TestAttempt.findOne({
      user: req.user._id,
      test: test._id,
      status: "in-progress",
    });

    if (existingAttempt) {
      const safeQuestions = await Promise.all(
        existingAttempt.questions.map(async (attemptQuestion) => {
          const originalQuestion = test.questions.id(
            attemptQuestion.questionId
          );

          if (!originalQuestion) return null;

          return {
            _id: originalQuestion._id,
            question: originalQuestion.question,
            options: originalQuestion.options,
            marks: attemptQuestion.marks,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Existing test attempt resumed",
        attemptId: existingAttempt._id,
        startedAt: existingAttempt.startedAt,
        expiresAt: existingAttempt.expiresAt,
        durationMinutes: test.durationMinutes,
        questions: safeQuestions.filter(Boolean),
      });
    }

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() + test.durationMinutes * 60 * 1000
    );

    const attempt = await TestAttempt.create({
      user: req.user._id,
      test: test._id,
      status: "in-progress",

      questions: test.questions.map((question) => ({
        questionId: question._id,
        correctOptionIndex: question.correctOptionIndex,
        marks: question.marks,
        optionCount: question.options.length,
      })),

      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      startedAt,
      expiresAt,
    });

    const safeQuestions = test.questions.map((question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
      marks: question.marks,
    }));

    return res.status(201).json({
      success: true,
      message: "Test started successfully",
      attemptId: attempt._id,
      startedAt,
      expiresAt,
      durationMinutes: test.durationMinutes,
      questions: safeQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get complete test details for admin (including correct answers)
const getAdminTestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: SUBMIT TEST AND CALCULATE RESULT
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!mongoose.isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    if (attempt.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This test has already been submitted",
      });
    }

    const isExpired = Date.now() > attempt.expiresAt.getTime();

    const finalAnswers = isExpired ? [] : answers;

    const validQuestionIds = new Set(
      attempt.questions.map((question) =>
        question.questionId.toString()
      )
    );

    const answerMap = new Map();

    for (const answer of finalAnswers) {
      if (
        !answer ||
        !mongoose.isValidObjectId(answer.questionId) ||
        !validQuestionIds.has(answer.questionId) ||
        !Number.isInteger(answer.selectedOptionIndex) ||
        answer.selectedOptionIndex < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer data",
        });
      }

      if (answerMap.has(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate answer for a question",
        });
      }

      answerMap.set(
        answer.questionId,
        answer.selectedOptionIndex
      );
    }

    // Validate selected option indexes using the saved snapshot
    const optionCounts = new Map(
      attempt.questions.map((question) => [
        question.questionId.toString(),
        question.optionCount,
      ])
    );

    for (const [questionId, selectedIndex] of answerMap.entries()) {
      const optionCount = optionCounts.get(questionId);

      if (
        optionCount === undefined ||
        selectedIndex >= optionCount
      ) {
        return res.status(400).json({
          success: false,
          message: "Selected option is invalid",
        });
      }
    }

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    for (const question of attempt.questions) {
      const questionId = question.questionId.toString();

      if (!answerMap.has(questionId)) {
        continue;
      }

      const selectedIndex = answerMap.get(questionId);

      if (selectedIndex === question.correctOptionIndex) {
        score += question.marks;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    }

    const attemptedQuestions = answerMap.size;
    const totalQuestions = attempt.questions.length;

    const percentage =
      attempt.totalMarks > 0
        ? Number(((score / attempt.totalMarks) * 100).toFixed(2))
        : 0;

    const completedAt = new Date();

    // Save attempt first
    attempt.answers = Array.from(answerMap.entries()).map(
      ([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      })
    );

    attempt.score = score;
    attempt.percentage = percentage;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.attemptedQuestions = attemptedQuestions;
    attempt.status = "completed";
    attempt.completedAt = completedAt;

    await attempt.save();

    // Save result using attempt snapshot
    const result = await Result.create({
      user: req.user._id,
      test: attempt.test,
      attempt: attempt._id,
      score,
      totalMarks: attempt.totalMarks,
      percentage,
      correctAnswers,
      wrongAnswers,
      attemptedQuestions,
      totalQuestions,
      passed: score >= attempt.passingMarks,
      completedAt,
    });

    return res.status(200).json({
      success: true,
      message: isExpired
        ? "Test time expired. Test was auto-submitted."
        : "Test submitted successfully",
      result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Result for this attempt already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: GET OWN RESULTS
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({
      user: req.user._id,
    })
      .populate("test", "title category durationMinutes")
      .sort({ completedAt: -1 });

    return res.status(200).json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STUDENT: GET ONE OF OWN RESULTS
const getMyResultById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

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

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  getAdminTestById,
  updateTest,
  deleteTest,
  startTest,
  submitTest,
  getMyResults,
  getMyResultById,
};