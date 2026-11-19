
const { randomUUID } = require("crypto");
const path = require("path");

const StudyMaterial = require("../models/StudyMaterial");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const allowedCategories = [
  "aptitude",
  "reasoning",
  "verbal",
  "technical",
  "programming",
  "interview",
  "resume",
  "other",
];

const allowedTypes = ["pdf", "video", "link", "document", "other"];

const validateUploadedFile = (file, materialType) => {
  if (!file) return null;

  const extension = path.extname(file.originalname).toLowerCase();

  if (materialType === "pdf" && extension !== ".pdf") {
    return "PDF material only accepts .pdf files";
  }

  if (
    materialType === "document" &&
    ![".doc", ".docx"].includes(extension)
  ) {
    return "Document material only accepts .doc and .docx files";
  }

  if (!["pdf", "document"].includes(materialType)) {
    return "File upload is only supported for PDF and document materials";
  }

  return null;
};

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const originalName = file.originalname;
    const extension = path.extname(originalName).toLowerCase();

    const safeName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 80);

    const publicId = `${safeName}-${randomUUID()}${extension}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "placement-portal/study-materials",
        public_id: publicId,
        resource_type: "raw",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

const deleteCloudinaryFile = async (publicId) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
};


const parseTags = (tags) => {
  if (tags === undefined) return undefined;
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);

      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  }

  throw new Error("Tags must be an array or comma-separated string");
};

const getMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  if (req.query.category) {
    filter.category = req.query.category.toLowerCase();
  }

  if (req.query.subject) {
    filter.subject = new RegExp(req.query.subject.trim(), "i");
  }

  if (req.query.materialType) {
    filter.materialType = req.query.materialType.toLowerCase();
  }

  if (req.query.topic) {
    filter.topic = new RegExp(req.query.topic.trim(), "i");
  }

  if (req.query.search && req.query.search.trim()) {
    const search = req.query.search.trim();

    filter.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { subject: new RegExp(search, "i") },
      { topic: new RegExp(search, "i") },
      { tags: new RegExp(search, "i") },
    ];
  }

  const [materials, total] = await Promise.all([
    StudyMaterial.find(filter)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    StudyMaterial.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    materials,
  });
});

const getMaterialById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({
    _id: req.params.id,
    isActive: true,
  }).populate("uploadedBy", "name");

  if (!material) {
    return res.status(404).json({
      success: false,
      message: "Study material not found",
    });
  }

  res.status(200).json({
    success: true,
    material,
  });
});


const createMaterial = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    subject,
    topic,
    materialType,
    fileUrl,
    thumbnailUrl,
    externalUrl,
  } = req.body;

  if (!title || !category || !subject || !materialType) {
    return res.status(400).json({
      success: false,
      message: "Title, category, subject and materialType are required",
    });
  }

  const normalizedCategory = category.toLowerCase();
  const normalizedType = materialType.toLowerCase();

  if (!allowedCategories.includes(normalizedCategory)) {
    return res.status(400).json({
      success: false,
      message: "Invalid material category",
    });
  }

  if (!allowedTypes.includes(normalizedType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid material type",
    });
  }

  const fileError = validateUploadedFile(req.file, normalizedType);

  if (fileError) {
    return res.status(400).json({
      success: false,
      message: fileError,
    });
  }

  if (
    ["pdf", "document"].includes(normalizedType) &&
    !req.file &&
    !fileUrl
  ) {
    return res.status(400).json({
      success: false,
      message: "Upload a file or provide fileUrl for PDF/document material",
    });
  }

  if (
    ["video", "link"].includes(normalizedType) &&
    !externalUrl
  ) {
    return res.status(400).json({
      success: false,
      message: "externalUrl is required for video and link materials",
    });
  }

  let tags;

  try {
    tags = parseTags(req.body.tags);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  let uploadedFile = null;

  try {
    if (req.file) {
      uploadedFile = await uploadToCloudinary(req.file);
    }

    const material = await StudyMaterial.create({
      title,
      description,
      category: normalizedCategory,
      subject,
      topic,
      materialType: normalizedType,
      fileUrl: uploadedFile ? uploadedFile.secure_url : fileUrl || "",
      cloudinaryPublicId: uploadedFile ? uploadedFile.public_id : "",
      thumbnailUrl,
      externalUrl,
      tags: tags || [],
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Study material created successfully",
      material,
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await deleteCloudinaryFile(uploadedFile.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    throw error;
  }
});


const updateMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: "Study material not found",
    });
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "subject",
    "topic",
    "materialType",
    "fileUrl",
    "thumbnailUrl",
    "externalUrl",
    "isActive",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.category) {
    updates.category = updates.category.toLowerCase();
  }

  if (updates.materialType) {
    updates.materialType = updates.materialType.toLowerCase();
  }

  if (
    updates.category &&
    !allowedCategories.includes(updates.category)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid material category",
    });
  }

  if (
    updates.materialType &&
    !allowedTypes.includes(updates.materialType)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid material type",
    });
  }

  let tags;

  try {
    tags = parseTags(req.body.tags);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (tags !== undefined) {
    updates.tags = tags;
  }

  const newType = updates.materialType || material.materialType;

  const fileError = validateUploadedFile(req.file, newType);

  if (fileError) {
    return res.status(400).json({
      success: false,
      message: fileError,
    });
  }

  const resultingFileUrl =
    req.file || updates.fileUrl !== undefined
      ? updates.fileUrl
      : material.fileUrl;

  if (
    ["pdf", "document"].includes(newType) &&
    !req.file &&
    !resultingFileUrl
  ) {
    return res.status(400).json({
      success: false,
      message: "A file or fileUrl is required for PDF/document material",
    });
  }

  const resultingExternalUrl =
    updates.externalUrl !== undefined
      ? updates.externalUrl
      : material.externalUrl;

  if (
    ["video", "link"].includes(newType) &&
    !resultingExternalUrl
  ) {
    return res.status(400).json({
      success: false,
      message: "externalUrl is required for video and link materials",
    });
  }

  let uploadedFile = null;
  const oldPublicId = material.cloudinaryPublicId;

  try {
    if (req.file) {
      uploadedFile = await uploadToCloudinary(req.file);

      updates.fileUrl = uploadedFile.secure_url;
      updates.cloudinaryPublicId = uploadedFile.public_id;
    }

    Object.assign(material, updates);

    await material.save();

    if (
      uploadedFile &&
      oldPublicId &&
      oldPublicId !== uploadedFile.public_id
    ) {
      try {
        await deleteCloudinaryFile(oldPublicId);
      } catch (cleanupError) {
        console.error(
          "Old Cloudinary file deletion failed:",
          cleanupError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Study material updated successfully",
      material,
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await deleteCloudinaryFile(uploadedFile.public_id);
      } catch (cleanupError) {
        console.error(
          "New Cloudinary file cleanup failed:",
          cleanupError.message
        );
      }
    }

    throw error;
  }
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!material) {
    return res.status(404).json({
      success: false,
      message: "Study material not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Study material deactivated successfully",
  });
});

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
