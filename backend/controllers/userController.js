
const User = require("../models/User");

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      college,
      course,
      graduationYear,
      skills,
    } = req.body;

    const allowedUpdates = {
      name,
      phone,
      college,
      course,
      graduationYear,
      skills,
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
