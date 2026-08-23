import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../components/Input";
import Button from "../components/Button";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    const savedUser = localStorage.getItem(
      "skillbridgeUser"
    );

    if (!savedUser) {
      setError(
        "No account found. Please create an account first."
      );
      return;
    }

    const user = JSON.parse(savedUser);

    if (
      formData.email !== user.email ||
      formData.password !== user.password
    ) {
      setError("Invalid email or password.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem(
        "skillbridgeRememberMe",
        "true"
      );
    } else {
      localStorage.removeItem(
        "skillbridgeRememberMe"
      );
    }

    localStorage.setItem(
      "skillbridgeLoggedIn",
      "true"
    );

    navigate("/");
  };

  return (
    <main className="login-page">

      <div className="login-container">

        <div className="login-card">

          <div className="login-header">

            <p className="login-tagline">
              Welcome back
            </p>

            <h1 className="login-title">
              Login to SkillBridge AI
            </h1>

            <p className="login-description">
              Continue your learning and skill journey.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

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
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span>
                  Remember Me
                </span>

              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot Password?
              </Link>

            </div>

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="login-submit"
            >
              Login
            </Button>

          </form>

          <div className="login-footer">

            <p>
              Don't have an account?{" "}
              <Link to="/register">
                Create Account
              </Link>
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Login;