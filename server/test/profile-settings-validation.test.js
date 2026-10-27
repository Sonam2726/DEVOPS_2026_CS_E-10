const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const userController = require("../controllers/userController");
const settingsController = require("../controllers/settingsController");
const User = require("../models/User");

const userId = "507f1f77bcf86cd799439011";

const response = () => {
  const result = {};
  return {
    result,
    status(code) {
      result.status = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
};

const request = (body = {}) => ({ body, user: { userId } });

describe("profile and settings persistence", () => {
  it("persists a validated email update for the authenticated user", async (t) => {
    const updatedUser = {
      _id: userId,
      name: "User",
      email: "new@example.com",
      bio: "",
      location: "",
      profileImage: "",
      role: "student",
      isActive: true,
    };
    const update = t.mock.method(User, "findByIdAndUpdate", () =>
      Promise.resolve(updatedUser)
    );
    const res = response();

    await userController.updateProfile(
      request({ email: " NEW@EXAMPLE.COM " }),
      res
    );

    assert.equal(update.mock.calls[0].arguments[0], userId);
    assert.deepEqual(update.mock.calls[0].arguments[1], {
      $set: { email: "new@example.com" },
    });
    assert.equal(res.result.status, 200);
    assert.equal(res.result.body.data.profile.email, "new@example.com");
  });

  it("rejects invalid email before database access", async (t) => {
    const update = t.mock.method(User, "findByIdAndUpdate", () =>
      Promise.resolve(null)
    );
    const res = response();

    await userController.updateProfile(request({ email: "not-an-email" }), res);

    assert.equal(res.result.status, 400);
    assert.equal(res.result.body.message, "Please provide a valid email address");
    assert.equal(update.mock.callCount(), 0);
  });

  it("persists only supported settings for the authenticated user", async (t) => {
    const update = t.mock.method(User, "findByIdAndUpdate", () => ({
      select: () => Promise.resolve({ settings: { emailNotifications: false } }),
    }));
    const res = response();

    await settingsController.updateSettings(
      request({ emailNotifications: false, role: "admin" }),
      res
    );

    assert.deepEqual(update.mock.calls[0].arguments[1], {
      $set: { "settings.emailNotifications": false },
    });
    assert.equal(res.result.status, 200);
  });
});
