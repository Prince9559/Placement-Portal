require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    if (!process.env.ADMIN_NAME ||
        !process.env.ADMIN_EMAIL ||
        !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = "admin";
      await admin.save();
      console.log("Existing user promoted to admin:", email);
    } else {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        12
      );

      admin = await User.create({
        name: process.env.ADMIN_NAME,
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created:", email);
    }
  } catch (error) {
    console.error("Admin seeder failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();