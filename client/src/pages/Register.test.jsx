import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Register from "./Register";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
    target: { value: "New Learner" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
    target: { value: "learner@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Create a password"), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
    target: { value: "password123" },
  });
};

describe("Register page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates required fields before sending a request", () => {
    renderRegister();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("registers successfully and navigates to login with a message", async () => {
    fetch.mockResolvedValue(
      response({ success: true, message: "User registered successfully" }, 201)
    );
    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await vi.waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { registrationMessage: "Account created successfully. Please log in." },
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "New Learner",
          email: "learner@example.com",
          password: "password123",
        }),
      })
    );
  });

  it("shows a server error without navigating", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "User already exists" }, 409)
    );
    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows a network error when registration cannot connect", async () => {
    fetch.mockRejectedValue(new TypeError("Network error"));
    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("Could not connect to the server. Please try again.")
    ).toBeInTheDocument();
  });
});
