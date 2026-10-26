import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Login from "./Login";

const mockNavigate = vi.fn();
const testUser = {
  id: "<test-user-id>",
  name: "Test User",
  email: "test@example.com",
  role: "learner",
};
const successfulLoginResponse = {
  success: true,
  data: {
    token: "<test-jwt>",
    user: testUser,
  },
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.stubGlobal("fetch", vi.fn());

    renderLogin();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the login page correctly", () => {
    expect(
      screen.getByRole("heading", {
        name: /login to skillbridge ai/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /login/i,
      })
    ).toBeInTheDocument();
  });

  it("allows the user to enter email and password", () => {
    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    const passwordInput = screen.getByPlaceholderText(
      /enter your password/i
    );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "Test@123",
      },
    });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("Test@123");
  });

  it("shows the server error when no account exists", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        message: "No account found. Please create an account first.",
      }),
    });

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    const passwordInput = screen.getByPlaceholderText(
      /enter your password/i
    );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "Test@123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    expect(
      await screen.findByText(
        /no account found\. please create an account first/i
      )
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledOnce();
    expect(localStorage.getItem("skillbridgeToken")).toBeNull();
    expect(localStorage.getItem("skillbridgeToken")).not.toBe("demo-token");
  });

  it("shows the server error for invalid email or password", async () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Wrong@123",
      })
    );
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: "Invalid email or password",
      }),
    });

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    const passwordInput = screen.getByPlaceholderText(
      /enter your password/i
    );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "Wrong@123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledOnce();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("skillbridgeLoggedIn")).toBeNull();
    expect(localStorage.getItem("skillbridgeToken")).toBeNull();
    expect(localStorage.getItem("skillbridgeToken")).not.toBe("demo-token");
  });

  it("logs in successfully with valid server credentials", async () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Test@123",
      })
    );
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => successfulLoginResponse,
    });

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    const passwordInput = screen.getByPlaceholderText(
      /enter your password/i
    );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "Test@123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "Test@123",
        }),
      })
    );
    expect(
      localStorage.getItem("skillbridgeLoggedIn")
    ).toBe("true");
    expect(localStorage.getItem("skillbridgeToken")).toBe("<test-jwt>");
    expect(localStorage.getItem("skillbridgeUser")).toBe(
      JSON.stringify(testUser)
    );
    expect(localStorage.getItem("skillbridgeToken")).not.toBe("demo-token");
  });

  it("handles Remember Me correctly after server login", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => successfulLoginResponse,
    });

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    const passwordInput = screen.getByPlaceholderText(
      /enter your password/i
    );

    const rememberCheckbox = screen.getByRole("checkbox");

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "Test@123",
      },
    });

    fireEvent.click(rememberCheckbox);

    expect(rememberCheckbox).toBeChecked();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    expect(
      localStorage.getItem("skillbridgeRememberMe")
    ).toBe("true");
    expect(localStorage.getItem("skillbridgeToken")).toBe("<test-jwt>");
    expect(localStorage.getItem("skillbridgeToken")).not.toBe("demo-token");
  });

  it("contains the Forgot Password link", () => {
    const forgotPasswordLink = screen.getByRole("link", {
      name: /forgot password/i,
    });

    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("contains the Create Account link", () => {
    const createAccountLink = screen.getByRole("link", {
      name: /create account/i,
    });

    expect(createAccountLink).toBeInTheDocument();
    expect(createAccountLink).toHaveAttribute(
      "href",
      "/register"
    );
  });
});