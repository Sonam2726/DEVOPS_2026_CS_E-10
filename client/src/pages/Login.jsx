import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Input from "../components/Input";
import Button from "../components/Button";

import "./Login.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(
    location.state?.registrationMessage || ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = formData.email.trim();

    if (!normalizedEmail || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: formData.password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message || "Invalid email or password");
        return;
      }

      const { token, user } = result.data || {};

      if (result.success !== true || !token || !user) {
        setError("Login response was incomplete. Please try again.");
        return;
      }

      localStorage.setItem("skillbridgeToken", token);
      localStorage.setItem("skillbridgeUser", JSON.stringify(user));
      localStorage.setItem("skillbridgeLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("skillbridgeRememberMe", "true");
      } else {
        localStorage.removeItem("skillbridgeRememberMe");
      }

      navigate("/dashboard");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <p className="login-tagline">Welcome back</p>
            <h1 className="login-title">Login to SkillBridge AI</h1>
            <p className="login-description">
              Continue your learning and skill journey.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            {error && <p className="form-error">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              className="login-submit"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;