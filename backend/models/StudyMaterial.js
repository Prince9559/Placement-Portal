
const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Material title is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "aptitude",
        "reasoning",
        "verbal",
        "technical",
        "programming",
        "interview",
        "resume",
        "other",
      ],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    topic: {
      type: String,
      trim: true,
      default: "",
    },

    materialType: {
      type: String,
      required: [true, "Material type is required"],
      enum: ["pdf", "video", "link", "document", "other"],
    },

    fileUrl: {
      type: String,
      trim: true,
      default: "",
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    externalUrl: {
      type: String,
      trim: true,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

studyMaterialSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  topic: "text",
});

studyMaterialSchema.index({
  category: 1,
  subject: 1,
  isActive: 1,
});

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
