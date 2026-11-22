
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Layers, Eye, EyeOff } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password) {
      toast.warning("Please enter email and password.");
      return;
    }

    try {
      const user = await login({
        email,
        password: formData.password,
      });

      if (user.role !== selectedRole) {
        toast.error(
          `This account is not registered as ${selectedRole}. Please select the correct login option.`
        );
        return;
      }

      toast.success("Login successful!");

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LEFT DESIGN PANEL */}
        <div className="auth-left-panel">
          <div className="auth-brand-icon">
            <Layers size={34} />
          </div>

          <div className="auth-brand-content">
            <h1>Placement Portal</h1>

            <h3>
              Learn better. Prepare smarter. Get placed.
            </h3>

            <div className="auth-brand-line"></div>

            <p>
              One powerful platform to manage your placement
              preparation, student activities, and administration.
            </p>
          </div>

          <div className="auth-brand-footer">
            Your future starts here.
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="auth-right-panel">

          <div className="auth-heading">
            <h1>Welcome Back</h1>
            <p>
              Sign in to continue to your Placement Portal account.
            </p>
          </div>

          {/* ROLE SELECTION */}
          <div className="auth-role-selection">
            <button
              type="button"
              className={`auth-role-option ${
                selectedRole === "student" ? "active" : ""
              }`}
              onClick={() => setSelectedRole("student")}
            >
              Student Login
            </button>

            <button
              type="button"
              className={`auth-role-option ${
                selectedRole === "admin" ? "active" : ""
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              Admin Login
            </button>
          </div>

          {/* SELECTED ROLE */}
          <div className="auth-selected-heading">
            <h2>
              {selectedRole === "admin"
                ? "Admin Login"
                : "Student Login"}
            </h2>

            <p>
              {selectedRole === "admin"
                ? "Sign in to manage the Placement Portal."
                : "Sign in to continue your placement preparation."}
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD WITH SHOW / HIDE */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* FOOTER */}
          {selectedRole === "student" && (
            <p className="auth-footer">
              Don't have an account?{" "}
              <Link to="/register">Register</Link>
            </p>
          )}

          {selectedRole === "admin" && (
            <p className="auth-footer auth-admin-footer">
              Authorized administrators only.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
