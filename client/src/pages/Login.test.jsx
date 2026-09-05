import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Login from "./Login";

const mockNavigate = vi.fn();

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

    renderLogin();
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

  it("shows an error when no account exists", () => {
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
      screen.getByText(
        /no account found\. please create an account first/i
      )
    ).toBeInTheDocument();
  });

  it("shows an error for invalid email or password", () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Correct@123",
      })
    );

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
      screen.getByText(/invalid email or password/i)
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("logs in successfully with valid credentials", () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Test@123",
      })
    );

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
      localStorage.getItem("skillbridgeLoggedIn")
    ).toBe("true");

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("handles Remember Me correctly", () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Test@123",
      })
    );

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

    expect(
      localStorage.getItem("skillbridgeRememberMe")
    ).toBe("true");
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