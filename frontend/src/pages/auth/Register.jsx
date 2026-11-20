
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    college: "",
    course: "BCA",
    graduationYear: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      toast.warning("Password must contain at least 8 characters.");
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      await register({
        ...userData,
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone.trim(),
        college: userData.college.trim(),
        graduationYear: Number(userData.graduationYear),
      });

      toast.success("Registration successful! Please login.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-heading">
          <h1>Create Account</h1>
          <p>Join Placement Portal and prepare for your career.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="college">College Name</label>
            <input
              id="college"
              name="college"
              type="text"
              placeholder="Enter your college name"
              value={formData.college}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course</label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
            >
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
              <option value="B.Sc">B.Sc</option>
              <option value="M.Sc">M.Sc</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year</label>
            <input
              id="graduationYear"
              name="graduationYear"
              type="number"
              min="2000"
              max="2100"
              placeholder="Example: 2027"
              value={formData.graduationYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Enter password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
