import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Exchange.css";

const Exchange = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("ready");

  const handleRequest = () => {
    setStatus("pending");
  };

  return (
    <div className="exchange-page">
      <div className="exchange-container">

        <button
          className="exchange-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="exchange-header">
          <h1>Skill Exchange</h1>
          <p>
            Exchange your skills and learn something new together.
          </p>
        </div>

        <div className="exchange-card">

          {/* Partner */}
          <div className="exchange-partner">
            <div className="exchange-avatar">
              A
            </div>

            <div>
              <h2>Aarav Sharma</h2>
              <p>JavaScript • Intermediate</p>
            </div>
          </div>

          {/* Exchange Skills */}
          <div className="exchange-skills">

            <div className="skill-box">
              <span>You Teach</span>
              <h3>HTML & CSS</h3>
              <p>Intermediate</p>
            </div>

            <div className="exchange-arrow">
              ⇄
            </div>

            <div className="skill-box">
              <span>You Learn</span>
              <h3>JavaScript</h3>
              <p>Intermediate</p>
            </div>

          </div>

          {/* Availability */}
          <div className="availability-box">
            <div>
              <span>Preferred Time</span>
              <strong>Evenings</strong>
            </div>

            <div>
              <span>Session Type</span>
              <strong>Online</strong>
            </div>
          </div>

          {/* Status */}
          <div className={`exchange-status ${status}`}>

            {status === "ready" && (
              <>
                <strong>Ready to connect</strong>
                <p>Send a request to start your skill exchange.</p>
              </>
            )}

            {status === "pending" && (
              <>
                <strong>Request Pending</strong>
                <p>
                  Your exchange request has been sent to Aarav.
                </p>
              </>
            )}

          </div>

          {/* CTA */}
          {status === "ready" ? (
            <button
              className="exchange-request-btn"
              onClick={handleRequest}
            >
              Send Exchange Request
            </button>
          ) : (
            <button
              className="exchange-view-btn"
              onClick={() => navigate("/requests")}
            >
              View Request Status
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default Exchange;