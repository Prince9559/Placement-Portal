
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {getMaterials,getMaterialById,createMaterial,updateMaterial,deleteMaterial,} = require("../controllers/materialController");


router.get("/", protect, getMaterials);
router.get("/:id", protect, getMaterialById);
router.post( "/",protect,adminOnly,upload.single("file"),createMaterial);
router.put("/:id",protect,adminOnly,upload.single("file"),updateMaterial);
router.delete("/:id", protect, adminOnly, deleteMaterial);
module.exports = router;
