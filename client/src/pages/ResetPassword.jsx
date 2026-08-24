import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../components/Input";
import Button from "../components/Button";

import "./ResetPassword.css";

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage(
      "Your password has been reset successfully."
    );
  };

  return (
    <main className="reset-page">
      <div className="reset-container">

        <div className="reset-card">

          <div className="reset-header">
            <p className="reset-tagline">
              Account Recovery
            </p>

            <h1 className="reset-title">
              Reset your password
            </h1>

            <p className="reset-description">
              Create a new password for your
              SkillBridge AI account.
            </p>
          </div>

          <form
            className="reset-form"
            onSubmit={handleSubmit}
          >
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="Create a new password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="reset-error">
                {error}
              </p>
            )}

            {message && (
              <p className="reset-success">
                {message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="reset-submit"
            >
              Reset Password
            </Button>
          </form>

          <div className="reset-footer">

            {message ? (
              <button
                type="button"
                className="reset-login-link"
                onClick={() => navigate("/login")}
              >
                Continue to Login
              </button>
            ) : (
              <Link to="/forgot-password">
                Back to Forgot Password
              </Link>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}

export default ResetPassword;