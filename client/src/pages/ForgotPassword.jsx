import { useState } from "react";
import { Link } from "react-router-dom";

import Input from "../components/Input";
import Button from "../components/Button";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage(
      "If an account exists with this email, a reset link will be sent."
    );
  };

  return (
    <main className="forgot-page">

      <div className="forgot-container">

        <div className="forgot-card">

          <div className="forgot-header">

            <p className="forgot-tagline">
              Account Recovery
            </p>

            <h1 className="forgot-title">
              Forgot your password?
            </h1>

            <p className="forgot-description">
              Enter your email address and we'll help
              you recover your account.
            </p>

          </div>

          <form
            className="forgot-form"
            onSubmit={handleSubmit}
          >

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            {message && (
              <p className="forgot-message">
                {message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="forgot-submit"
            >
              Send Reset Link
            </Button>

          </form>

          <div className="forgot-footer">
            <Link to="/login">
              Back to Login
            </Link>
          </div>

        </div>

      </div>

    </main>
  );
}

export default ForgotPassword;