import { useState } from "react";

import "./Input.css";

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="input-group">

      <label htmlFor={name} className="input-label">
        {label}
      </label>

      <div className="input-wrapper">

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`input-field ${error ? "input-error" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 8.73 3.11 10 8a11.6 11.6 0 0 1-2.03 4.08" />
                <path d="M6.61 6.61C4.62 7.83 3.22 9.63 2 12c1.27 4.89 5 8 10 8a10.94 10.94 0 0 0 3.12-.45" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

      </div>

      {error && (
        <p className="input-error-message">
          {error}
        </p>
      )}

    </div>
  );
};

export default Input;