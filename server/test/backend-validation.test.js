const assert = require("node:assert/strict");
const { after, describe, it } = require("node:test");

const TEST_JWT_SECRET = "backend-unit-test-only-secret";
const hadJwtSecret = Object.prototype.hasOwnProperty.call(
  process.env,
  "JWT_SECRET"
);
const previousJwtSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = TEST_JWT_SECRET;

after(() => {
  if (hadJwtSecret) {
    process.env.JWT_SECRET = previousJwtSecret;
  } else {
    delete process.env.JWT_SECRET;
  }
});

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const protect = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const requestController = require("../controllers/requestController");
const sessionController = require("../controllers/sessionController");
const skillController = require("../controllers/skillController");
const reviewController = require("../controllers/reviewController");
const matchingController = require("../controllers/matchingController");
const chatController = require("../controllers/chatController");
const notificationController = require("../controllers/notificationController");
const dashboardController = require("../controllers/dashboardController");
const userController = require("../controllers/userController");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");
const Session = require("../models/Session");
const Notification = require("../models/Notification");

const validId = "507f1f77bcf86cd799439011";

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

const assertErrorResponse = (res, status, message) => {
  assert.equal(res.result.status, status);
  assert.equal(res.result.body.success, false);
  assert.equal(res.result.body.message, message);
};

const request = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { userId: validId },
  ...overrides,
});

describe("authentication middleware", () => {
  it("rejects a missing authorization header", () => {
    const res = response();
    let nextCalled = false;

    protect(request(), res, () => {
      nextCalled = true;
    });

    assertErrorResponse(res, 401, "Authentication token is required");
    assert.equal(nextCalled, false);
  });
});

describe("dashboard controller", () => {
  const setupDashboardMocks = (t, values) => {
    const user = {
      _id: validId,
      name: "Dashboard User",
      email: "dashboard@example.com",
      bio: "Learning",
      location: "Remote",
      profileImage: "profile.png",
      role: "student",
    };
    const userSelect = t.mock.fn(() => Promise.resolve(user));
    const findById = t.mock.method(User, "findById", () => ({
      select: userSelect,
    }));
    const skillCountDocuments = t.mock.method(
      Skill,
      "countDocuments",
      () => Promise.resolve(values.totalSkills)
    );
    const requestCounts = [
      values.sentRequests,
      values.receivedRequests,
      values.pendingRequests,
      values.acceptedRequests,
      values.rejectedRequests,
    ];
    let requestCountIndex = 0;
    const requestCountDocuments = t.mock.method(
      Request,
      "countDocuments",
      () => Promise.resolve(requestCounts[requestCountIndex++])
    );
    const sessionCounts = [
      values.mentorSessions,
      values.learnerSessions,
      values.upcomingSessions,
      values.completedSessions,
      values.cancelledSessions,
    ];
    let sessionCountIndex = 0;
    const sessionCountDocuments = t.mock.method(
      Session,
      "countDocuments",
      () => Promise.resolve(sessionCounts[sessionCountIndex++])
    );
    const notificationCounts = [
      values.totalNotifications,
      values.unreadNotifications,
    ];
    let notificationCountIndex = 0;
    const notificationCountDocuments = t.mock.method(
      Notification,
      "countDocuments",
      () => Promise.resolve(notificationCounts[notificationCountIndex++])
    );

    const notificationSelect = t.mock.fn(() =>
      Promise.resolve(values.recentNotifications)
    );
    const notificationLimit = t.mock.fn(() => ({
      select: notificationSelect,
    }));
    const notificationSort = t.mock.fn(() => ({
      limit: notificationLimit,
    }));
    const find = t.mock.method(Notification, "find", () => ({
      sort: notificationSort,
    }));

    return {
      user,
      findById,
      userSelect,
      countDocuments: [
        skillCountDocuments,
        requestCountDocuments,
        sessionCountDocuments,
        notificationCountDocuments,
      ],
      find,
      notificationSort,
      notificationLimit,
      notificationSelect,
    };
  };

  it("returns scoped dashboard statistics, user data, and recent activity", async (t) => {
    const recentNotifications = [
      {
        type: "request",
        title: "New request",
        message: "You received a request",
        isRead: false,
        createdAt: new Date("2026-10-26T10:00:00.000Z"),
      },
    ];
    const mocks = setupDashboardMocks(t, {
      totalSkills: 4,
      sentRequests: 3,
      receivedRequests: 2,
      pendingRequests: 1,
      acceptedRequests: 2,
      rejectedRequests: 0,
      mentorSessions: 5,
      learnerSessions: 6,
      upcomingSessions: 2,
      completedSessions: 7,
      cancelledSessions: 1,
      totalNotifications: 8,
      unreadNotifications: 3,
      recentNotifications,
    });

    describe("user controller profile handlers", () => {
      it("returns the authenticated user's populated profile", async (t) => {
        const user = {
          _id: validId,
          name: "Profile User",
          email: "profile@example.com",
          bio: "Learning every day",
          location: "Remote",
          profileImage: "profile.png",
          role: "student",
          isActive: true,
          skillsToTeach: [{ _id: "skill-teach", name: "JavaScript" }],
          skillsToLearn: [{ _id: "skill-learn", name: "Python" }],
          createdAt: new Date("2026-10-20T00:00:00.000Z"),
          updatedAt: new Date("2026-10-21T00:00:00.000Z"),
        };
        const populateSkillsToLearn = t.mock.fn(() => Promise.resolve(user));
        const populateSkillsToTeach = t.mock.fn(() => ({
          populate: populateSkillsToLearn,
        }));
        const findById = t.mock.method(User, "findById", () => ({
          populate: populateSkillsToTeach,
        }));
        const res = response();

        await userController.getProfile(request(), res);

        assert.deepEqual(findById.mock.calls[0].arguments, [validId]);
        assert.deepEqual(populateSkillsToTeach.mock.calls[0].arguments, [
          "skillsToTeach",
        ]);
        assert.deepEqual(populateSkillsToLearn.mock.calls[0].arguments, [
          "skillsToLearn",
        ]);
        assert.deepEqual(res.result.body, {
          success: true,
          message: "Profile fetched successfully",
          data: {
            profile: {
              id: validId,
              name: user.name,
              email: user.email,
              bio: user.bio,
              location: user.location,
              profileImage: user.profileImage,
              role: user.role,
              isActive: user.isActive,
              skillsToTeach: user.skillsToTeach,
              skillsToLearn: user.skillsToLearn,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          },
        });
        assert.equal(res.result.status, 200);
      });

      it("returns not-found and safe errors when fetching a profile fails", async (t) => {
        const findById = t.mock.method(User, "findById", () => ({
          populate: () => ({
            populate: () => Promise.resolve(null),
          }),
        }));
        const notFoundResponse = response();

        await userController.getProfile(request(), notFoundResponse);

        assertErrorResponse(notFoundResponse, 404, "User not found");
        assert.equal(findById.mock.callCount(), 1);

        t.mock.method(User, "findById", () => {
          throw new Error("database failure");
        });
        const errorResponse = response();

        await userController.getProfile(request(), errorResponse);

        assertErrorResponse(
          errorResponse,
          500,
          "Server error while fetching profile"
        );
      });

      it("updates all supported profile fields for the authenticated user", async (t) => {
        const updatedUser = {
          _id: validId,
          name: "Updated Name",
          email: "profile@example.com",
          bio: "Updated bio",
          location: "Updated location",
          profileImage: "updated.png",
          role: "student",
          isActive: true,
          createdAt: new Date("2026-10-20T00:00:00.000Z"),
          updatedAt: new Date("2026-10-26T00:00:00.000Z"),
        };
        const findByIdAndUpdate = t.mock.method(
          User,
          "findByIdAndUpdate",
          () => Promise.resolve(updatedUser)
        );
        const res = response();

        await userController.updateProfile(
          request({
            body: {
              name: "  Updated Name  ",
              bio: "  Updated bio  ",
              location: "  Updated location  ",
              profileImage: "  updated.png  ",
            },
          }),
          res
        );

        assert.deepEqual(findByIdAndUpdate.mock.calls[0].arguments, [
          validId,
          {
            $set: {
              name: "Updated Name",
              bio: "Updated bio",
              location: "Updated location",
              profileImage: "updated.png",
            },
          },
          { new: true, runValidators: true },
        ]);
        assert.deepEqual(res.result.body, {
          success: true,
          message: "Profile updated successfully",
          data: {
            profile: {
              id: validId,
              name: updatedUser.name,
              email: updatedUser.email,
              bio: updatedUser.bio,
              location: updatedUser.location,
              profileImage: updatedUser.profileImage,
              role: updatedUser.role,
              isActive: updatedUser.isActive,
              createdAt: updatedUser.createdAt,
              updatedAt: updatedUser.updatedAt,
            },
          },
        });
        assert.equal(res.result.status, 200);
      });

      it("rejects invalid profile updates before database access", async (t) => {
        const findByIdAndUpdate = t.mock.method(User, "findByIdAndUpdate", () =>
          Promise.resolve(null)
        );
        const cases = [
          [
            { name: "A" },
            "Name must be between 2 and 50 characters long",
          ],
          [
            { name: "A".repeat(51) },
            "Name must be between 2 and 50 characters long",
          ],
          [
            { bio: "B".repeat(301) },
            "Bio cannot exceed 300 characters",
          ],
          [
            { location: "L".repeat(101) },
            "Location cannot exceed 100 characters",
          ],
          [{}, "No valid profile fields provided for update"],
        ];

        for (const [body, message] of cases) {
          const res = response();
          await userController.updateProfile(request({ body }), res);
          assertErrorResponse(res, 400, message);
        }

        assert.equal(findByIdAndUpdate.mock.callCount(), 0);
      });

      it("returns not-found and safe errors when updating a profile fails", async (t) => {
        const findByIdAndUpdate = t.mock.method(User, "findByIdAndUpdate", () =>
          Promise.resolve(null)
        );
        const notFoundResponse = response();

        await userController.updateProfile(
          request({ body: { bio: "Updated bio" } }),
          notFoundResponse
        );

        assertErrorResponse(notFoundResponse, 404, "User not found");
        assert.deepEqual(findByIdAndUpdate.mock.calls[0].arguments[0], validId);

        t.mock.method(User, "findByIdAndUpdate", () => {
          throw new Error("database failure");
        });
        const errorResponse = response();

        await userController.updateProfile(
          request({ body: { bio: "Updated bio" } }),
          errorResponse
        );

        assertErrorResponse(
          errorResponse,
          500,
          "Server error while updating profile"
        );
      });

      it("updates both skill lists for the authenticated user", async (t) => {
        const skillsToTeach = [{ _id: "teach-1", name: "JavaScript" }];
        const skillsToLearn = [{ _id: "learn-1", name: "Python" }];
        const updatedUser = { skillsToTeach, skillsToLearn };
        const populateSkillsToLearn = t.mock.fn(() =>
          Promise.resolve(updatedUser)
        );
        const populateSkillsToTeach = t.mock.fn(() => ({
          populate: populateSkillsToLearn,
        }));
        const findByIdAndUpdate = t.mock.method(User, "findByIdAndUpdate", () => ({
          populate: populateSkillsToTeach,
        }));
        const res = response();

        await userController.updateUserSkills(
          request({
            body: {
              skillsToTeach: ["teach-1"],
              skillsToLearn: ["learn-1"],
            },
          }),
          res
        );

        assert.deepEqual(findByIdAndUpdate.mock.calls[0].arguments, [
          validId,
          {
            $set: {
              skillsToTeach: ["teach-1"],
              skillsToLearn: ["learn-1"],
            },
          },
          { new: true, runValidators: true },
        ]);
        assert.deepEqual(populateSkillsToTeach.mock.calls[0].arguments, [
          "skillsToTeach",
        ]);
        assert.deepEqual(populateSkillsToLearn.mock.calls[0].arguments, [
          "skillsToLearn",
        ]);
        assert.deepEqual(res.result.body, {
          success: true,
          message: "User skills updated successfully",
          data: { skillsToTeach, skillsToLearn },
        });
        assert.equal(res.result.status, 200);
      });

      it("rejects invalid or missing skill-list updates before database access", async (t) => {
        const findByIdAndUpdate = t.mock.method(User, "findByIdAndUpdate", () => ({
          populate: () => ({
            populate: () => Promise.resolve(null),
          }),
        }));
        const cases = [
          [{ skillsToTeach: "teach-1" }, "skillsToTeach must be an array"],
          [{ skillsToLearn: "learn-1" }, "skillsToLearn must be an array"],
          [{}, "Please provide skillsToTeach or skillsToLearn"],
        ];

        for (const [body, message] of cases) {
          const res = response();
          await userController.updateUserSkills(request({ body }), res);
          assertErrorResponse(res, 400, message);
        }

        assert.equal(findByIdAndUpdate.mock.callCount(), 0);
      });

      it("returns not-found and safe errors when updating user skills fails", async (t) => {
        const findByIdAndUpdate = t.mock.method(User, "findByIdAndUpdate", () => ({
          populate: () => ({
            populate: () => Promise.resolve(null),
          }),
        }));
        const notFoundResponse = response();

        await userController.updateUserSkills(
          request({ body: { skillsToTeach: [] } }),
          notFoundResponse
        );

        assertErrorResponse(notFoundResponse, 404, "User not found");
        assert.equal(findByIdAndUpdate.mock.callCount(), 1);

        t.mock.method(User, "findByIdAndUpdate", () => {
          throw new Error("database failure");
        });
        const errorResponse = response();

        await userController.updateUserSkills(
          request({ body: { skillsToLearn: [] } }),
          errorResponse
        );

        assertErrorResponse(
          errorResponse,
          500,
          "Server error while updating skills"
        );
      });
    });
    const res = response();

    await dashboardController.getDashboard(request(), res);

    assert.deepEqual(mocks.userSelect.mock.calls[0].arguments, [
      "name email bio location profileImage role",
    ]);
    assert.deepEqual(mocks.findById.mock.calls[0].arguments, [validId]);
    assert.deepEqual(mocks.find.mock.calls[0].arguments, [
      { user: validId },
    ]);
    assert.deepEqual(mocks.notificationSort.mock.calls[0].arguments, [
      { createdAt: -1 },
    ]);
    assert.deepEqual(mocks.notificationLimit.mock.calls[0].arguments, [5]);
    assert.deepEqual(mocks.notificationSelect.mock.calls[0].arguments, [
      "type title message isRead createdAt",
    ]);

    const countArguments = mocks.countDocuments.flatMap((mock) =>
      mock.mock.calls.map((call) => call.arguments[0])
    );
    assert.deepEqual(countArguments, [
      { owner: validId },
      { sender: validId },
      { receiver: validId },
      {
        $or: [{ sender: validId }, { receiver: validId }],
        status: "pending",
      },
      {
        $or: [{ sender: validId }, { receiver: validId }],
        status: "accepted",
      },
      {
        $or: [{ sender: validId }, { receiver: validId }],
        status: "rejected",
      },
      { mentor: validId },
      { learner: validId },
      {
        $or: [{ mentor: validId }, { learner: validId }],
        status: "upcoming",
      },
      {
        $or: [{ mentor: validId }, { learner: validId }],
        status: "completed",
      },
      {
        $or: [{ mentor: validId }, { learner: validId }],
        status: "cancelled",
      },
      { user: validId },
      { user: validId, isRead: false },
    ]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        user: {
          id: validId,
          name: mocks.user.name,
          email: mocks.user.email,
          bio: mocks.user.bio,
          location: mocks.user.location,
          profileImage: mocks.user.profileImage,
          role: mocks.user.role,
        },
        statistics: {
          totalSkills: 4,
          requests: {
            sent: 3,
            received: 2,
            pending: 1,
            accepted: 2,
            rejected: 0,
          },
          sessions: {
            mentor: 5,
            learner: 6,
            upcoming: 2,
            completed: 7,
            cancelled: 1,
          },
          notifications: {
            total: 8,
            unread: 3,
          },
        },
        recentActivity: recentNotifications,
      },
    });
    assert.equal(res.result.status, 200);
  });

  it("returns zero statistics and an empty activity list for empty datasets", async (t) => {
    setupDashboardMocks(t, {
      totalSkills: 0,
      sentRequests: 0,
      receivedRequests: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      mentorSessions: 0,
      learnerSessions: 0,
      upcomingSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalNotifications: 0,
      unreadNotifications: 0,
      recentNotifications: [],
    });
    const res = response();

    await dashboardController.getDashboard(request(), res);

    assert.equal(res.result.status, 200);
    assert.equal(res.result.body.success, true);
    assert.deepEqual(res.result.body.data.statistics, {
      totalSkills: 0,
      requests: {
        sent: 0,
        received: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
      },
      sessions: {
        mentor: 0,
        learner: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
      },
      notifications: {
        total: 0,
        unread: 0,
      },
    });
    assert.deepEqual(res.result.body.data.recentActivity, []);
  });

  it("returns not-found when the authenticated user does not exist", async (t) => {
    const userSelect = t.mock.fn(() => Promise.resolve(null));
    const findById = t.mock.method(User, "findById", () => ({
      select: userSelect,
    }));
    const countDocuments = t.mock.method(Skill, "countDocuments", () =>
      Promise.resolve(0)
    );
    const res = response();

    await dashboardController.getDashboard(request(), res);

    assertErrorResponse(res, 404, "User not found");
    assert.deepEqual(findById.mock.calls[0].arguments, [validId]);
    assert.deepEqual(userSelect.mock.calls[0].arguments, [
      "name email bio location profileImage role",
    ]);
    assert.equal(countDocuments.mock.callCount(), 0);
  });

  it("maps missing authentication context to the controller's safe 500 response", async () => {
    const res = response();

    await dashboardController.getDashboard({ user: undefined }, res);

    assertErrorResponse(
      res,
      500,
      "Server error while fetching dashboard data"
    );
  });

  it("maps a parallel model failure to a safe 500 response", async (t) => {
    const userSelect = t.mock.fn(() =>
      Promise.resolve({
        _id: validId,
        name: "Dashboard User",
        email: "dashboard@example.com",
        role: "student",
      })
    );
    t.mock.method(User, "findById", () => ({ select: userSelect }));
    const countDocuments = t.mock.method(Skill, "countDocuments", () =>
      Promise.reject(new Error("database failure"))
    );
    const res = response();

    await dashboardController.getDashboard(request(), res);

    assertErrorResponse(
      res,
      500,
      "Server error while fetching dashboard data"
    );
    assert.equal(countDocuments.mock.callCount(), 1);
  });
});

describe("auth controller registration and login", () => {
      it("registers a user with normalized fields and a hashed password", async (t) => {
        const plainPassword = "secret-password";
        const hashedPassword = "hashed-password";
        const user = {
          _id: validId,
          name: "Test User",
          email: "learner@example.com",
          role: "student",
          isActive: true,
          createdAt: new Date("2026-10-26T00:00:00.000Z"),
        };
        const findOne = t.mock.method(User, "findOne", () => Promise.resolve(null));
        const hash = t.mock.method(bcrypt, "hash", () =>
          Promise.resolve(hashedPassword)
        );
        const create = t.mock.method(User, "create", (payload) => {
          assert.equal(payload.password, hashedPassword);
          assert.notEqual(payload.password, plainPassword);
          return Promise.resolve(user);
        });
        const res = response();

        await authController.registerUser(
          request({
            body: {
              name: "  Test User  ",
              email: "  LEARNER@EXAMPLE.COM ",
              password: plainPassword,
            },
          }),
          res
        );

        assert.deepEqual(findOne.mock.calls[0].arguments, [
          { email: "learner@example.com" },
        ]);
        assert.deepEqual(hash.mock.calls[0].arguments, [plainPassword, 10]);
        assert.deepEqual(create.mock.calls[0].arguments, [
          {
            name: "Test User",
            email: "learner@example.com",
            password: hashedPassword,
          },
        ]);
        assert.deepEqual(res.result.body, {
          success: true,
          message: "User registered successfully",
          data: {
            user: {
              id: validId,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt,
            },
          },
        });
        assert.equal(res.result.status, 201);
      });

      it("rejects missing registration fields before database or hashing calls", async (t) => {
        const findOne = t.mock.method(User, "findOne", () => Promise.resolve(null));
        const hash = t.mock.method(bcrypt, "hash", () =>
          Promise.resolve("hashed-password")
        );
        const create = t.mock.method(User, "create", () => Promise.resolve({}));
        const cases = [
          {},
          { name: "Test User", email: "user@example.com" },
          { name: "Test User", password: "secret-password" },
          { email: "user@example.com", password: "secret-password" },
        ];

        for (const body of cases) {
          const res = response();
          await authController.registerUser(request({ body }), res);
          assertErrorResponse(res, 400, "Name, email and password are required");
        }

        assert.equal(findOne.mock.callCount(), 0);
        assert.equal(hash.mock.callCount(), 0);
        assert.equal(create.mock.callCount(), 0);
      });

      it("returns conflict for a duplicate registration email", async (t) => {
        const findOne = t.mock.method(User, "findOne", () =>
          Promise.resolve({ _id: "existing-user" })
        );
        const hash = t.mock.method(bcrypt, "hash", () =>
          Promise.resolve("hashed-password")
        );
        const create = t.mock.method(User, "create", () => Promise.resolve({}));
        const res = response();

        await authController.registerUser(
          request({
            body: {
              name: "Test User",
              email: "User@Example.com",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(
          res,
          409,
          "User with this email already exists"
        );
        assert.equal(findOne.mock.callCount(), 1);
        assert.equal(hash.mock.callCount(), 0);
        assert.equal(create.mock.callCount(), 0);
      });

      it("maps registration database or hashing failures to a safe 500", async (t) => {
        const findOne = t.mock.method(User, "findOne", () => {
          throw new Error("database failure");
        });
        const res = response();

        await authController.registerUser(
          request({
            body: {
              name: "Test User",
              email: "user@example.com",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(
          res,
          500,
          "Server error while registering user"
        );
        assert.equal(findOne.mock.callCount(), 1);
      });

      it("maps password hashing failures to a safe registration error", async (t) => {
        t.mock.method(User, "findOne", () => Promise.resolve(null));
        const hash = t.mock.method(bcrypt, "hash", () => {
          throw new Error("hash failure");
        });
        const res = response();

        await authController.registerUser(
          request({
            body: {
              name: "Test User",
              email: "user@example.com",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(
          res,
          500,
          "Server error while registering user"
        );
        assert.equal(hash.mock.callCount(), 1);
      });

      it("rejects missing login fields before querying the user", async (t) => {
        const findOne = t.mock.method(User, "findOne", () => ({
          select: () => Promise.resolve(null),
        }));

        for (const body of [{}, { email: "user@example.com" }, { password: "secret-password" }]) {
          const res = response();
          await authController.loginUser(request({ body }), res);
          assertErrorResponse(res, 400, "Email and password are required");
        }

        assert.equal(findOne.mock.callCount(), 0);
      });

      it("maps a null login body to the controller's handled 500 response", async () => {
        const res = response();

        await authController.loginUser(request({ body: null }), res);

        assertErrorResponse(res, 500, "Server error while logging in");
      });

      it("returns unauthorized when the login user is missing", async (t) => {
        const select = t.mock.fn(() => Promise.resolve(null));
        const findOne = t.mock.method(User, "findOne", () => ({ select }));
        const res = response();

        await authController.loginUser(
          request({
            body: {
              email: " User@Example.com ",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(res, 401, "Invalid email or password");
        assert.deepEqual(findOne.mock.calls[0].arguments, [
          { email: "user@example.com" },
        ]);
        assert.deepEqual(select.mock.calls[0].arguments, ["+password"]);
      });

      it("returns unauthorized for an incorrect password", async (t) => {
        const user = {
          _id: validId,
          email: "user@example.com",
          password: "stored-hash",
          isActive: true,
        };
        t.mock.method(User, "findOne", () => ({
          select: () => Promise.resolve(user),
        }));
        const compare = t.mock.method(bcrypt, "compare", () =>
          Promise.resolve(false)
        );
        const res = response();

        await authController.loginUser(
          request({
            body: {
              email: "user@example.com",
              password: "wrong-password",
            },
          }),
          res
        );

        assertErrorResponse(res, 401, "Invalid email or password");
        assert.deepEqual(compare.mock.calls[0].arguments, [
          "wrong-password",
          "stored-hash",
        ]);
      });

      it("returns forbidden for an inactive login account", async (t) => {
        const user = {
          _id: validId,
          email: "user@example.com",
          password: "stored-hash",
          isActive: false,
        };
        t.mock.method(User, "findOne", () => ({
          select: () => Promise.resolve(user),
        }));
        const compare = t.mock.method(bcrypt, "compare", () =>
          Promise.resolve(true)
        );
        const res = response();

        await authController.loginUser(
          request({
            body: {
              email: "user@example.com",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(res, 403, "User account is inactive");
        assert.equal(compare.mock.callCount(), 0);
      });

      it("returns the successful login contract with a generated JWT", async (t) => {
        const user = {
          _id: validId,
          name: "Test User",
          email: "user@example.com",
          password: "stored-hash",
          role: "student",
          isActive: true,
        };
        t.mock.method(User, "findOne", () => ({
          select: () => Promise.resolve(user),
        }));
        t.mock.method(bcrypt, "compare", () => Promise.resolve(true));
        const sign = t.mock.method(jwt, "sign", () => "test-token");
        const res = response();

        await authController.loginUser(
          request({
            body: {
              email: " User@Example.com ",
              password: "secret-password",
            },
          }),
          res
        );

        assert.deepEqual(sign.mock.calls[0].arguments, [
          { userId: validId, role: "student" },
          TEST_JWT_SECRET,
          { expiresIn: "1d" },
        ]);
        assert.deepEqual(res.result.body, {
          success: true,
          message: "Login successful",
          data: {
            token: "test-token",
            user: {
              id: validId,
              name: "Test User",
              email: "user@example.com",
              role: "student",
              isActive: true,
            },
          },
        });
        assert.equal(res.result.status, 200);
        assert.equal(JSON.stringify(res.result.body).includes("stored-hash"), false);
      });

      it("maps password comparison and token-generation failures to safe 500 responses", async (t) => {
        const user = {
          _id: validId,
          email: "user@example.com",
          password: "stored-hash",
          role: "student",
          isActive: true,
        };
        t.mock.method(User, "findOne", () => ({
          select: () => Promise.resolve(user),
        }));
        const compare = t.mock.method(bcrypt, "compare", () => {
          throw new Error("compare failure");
        });
        const res = response();

        await authController.loginUser(
          request({
            body: {
              email: "user@example.com",
              password: "secret-password",
            },
          }),
          res
        );

        assertErrorResponse(res, 500, "Server error while logging in");
        assert.equal(compare.mock.callCount(), 1);

        t.mock.method(bcrypt, "compare", () => Promise.resolve(true));
        const sign = t.mock.method(jwt, "sign", () => {
          throw new Error("sign failure");
        });
        const tokenErrorResponse = response();

        await authController.loginUser(
          request({
            body: {
              email: "user@example.com",
              password: "secret-password",
            },
          }),
          tokenErrorResponse
        );

        assertErrorResponse(
          tokenErrorResponse,
          500,
          "Server error while logging in"
        );
        assert.equal(sign.mock.callCount(), 1);
      });

  it("returns the current active user without exposing a password", async (t) => {
    const user = {
      _id: validId,
      name: "Test User",
      email: "user@example.com",
      password: "stored-hash",
      role: "student",
      isActive: true,
      createdAt: new Date("2026-10-26T00:00:00.000Z"),
      updatedAt: new Date("2026-10-27T00:00:00.000Z"),
    };
    const findById = t.mock.method(User, "findById", () =>
      Promise.resolve(user)
    );
    const res = response();

    await authController.getCurrentUser(request(), res);

    assert.deepEqual(findById.mock.calls[0].arguments, [validId]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Current user fetched successfully",
      data: {
        user: {
          id: validId,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
    assert.equal(res.result.status, 200);
    assert.equal(JSON.stringify(res.result.body).includes("stored-hash"), false);
  });

  it("returns not-found when the current user no longer exists", async (t) => {
    const findById = t.mock.method(User, "findById", () =>
      Promise.resolve(null)
    );
    const res = response();

    await authController.getCurrentUser(request(), res);

    assertErrorResponse(res, 404, "User not found");
    assert.equal(findById.mock.callCount(), 1);
  });

  it("returns forbidden for an inactive current user", async (t) => {
    const findById = t.mock.method(User, "findById", () =>
      Promise.resolve({ _id: validId, isActive: false })
    );
    const res = response();

    await authController.getCurrentUser(request(), res);

    assertErrorResponse(res, 403, "User account is inactive");
    assert.equal(findById.mock.callCount(), 1);
  });

  it("maps current-user database failures to a safe 500 response", async (t) => {
    const findById = t.mock.method(User, "findById", () => {
      throw new Error("database failure");
    });
    const res = response();

    await authController.getCurrentUser(request(), res);

    assertErrorResponse(
      res,
      500,
      "Server error while fetching current user"
    );
    assert.equal(findById.mock.callCount(), 1);
  });
});

describe("authentication middleware", () => {
  it("rejects malformed or invalid bearer tokens", () => {
    for (const token of ["Basic token", "Bearer"]) {
      const res = response();
      let nextCalled = false;
      protect(request({ headers: { authorization: token } }), res, () => {
        nextCalled = true;
      });

      assertErrorResponse(res, 401, "Authentication token is required");
      assert.equal(nextCalled, false);
    }

    const res = response();
    let nextCalled = false;
    protect(request({ headers: { authorization: "Bearer invalid" } }), res, () => {
      nextCalled = true;
    });
    assertErrorResponse(res, 401, "Invalid or expired authentication token");
    assert.equal(nextCalled, false);
  });

  it("accepts a valid test-only token and assigns the decoded user", () => {
    const token = jwt.sign({ userId: validId, role: "student" }, TEST_JWT_SECRET);
    const req = request({ headers: { authorization: `Bearer ${token}` } });
    const res = response();
    let nextCalled = false;

    protect(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.userId, validId);
    assert.equal(req.user.role, "student");
    assert.equal(res.result.status, undefined);
  });
});

describe("request controller validation", () => {
  it("rejects malformed bodies, receiver IDs, messages, and self-requests", async () => {
    const cases = [
      [{ body: [] }, "Request body must be a JSON object"],
      [{ body: { skillToLearn: "JavaScript" } }, "Receiver ID and skill are required"],
      [{ body: { receiverId: "bad", skillToLearn: "JavaScript" } }, "Invalid receiver ID"],
      [
        {
          body: { receiverId: validId, skillToLearn: "JavaScript", message: 42 },
        },
        "Message must be a string",
      ],
      [
        { body: { receiverId: validId, skillToLearn: "JavaScript" } },
        "You cannot send a request to yourself",
      ],
    ];

    for (const [overrides, message] of cases) {
      const res = response();
      await requestController.sendRequest(request(overrides), res);

      assertErrorResponse(res, 400, message);
    }
  });

  it("rejects invalid request status updates before database access", async () => {
    const res = response();

    await requestController.updateRequestStatus(
      request({ params: { id: "bad" }, body: { status: "accepted" } }),
      res
    );

    assertErrorResponse(res, 400, "Invalid request ID");
  });

  it("rejects unsupported request status values", async () => {
    const res = response();

    await requestController.updateRequestStatus(
      request({ params: { id: validId }, body: { status: "pending" } }),
      res
    );

    assertErrorResponse(res, 400, "Status must be accepted or rejected");
  });
});

describe("session controller validation", () => {
  it("rejects malformed creation input before database access", async () => {
    const cases = [
      [{ body: [] }, "Request body must be a JSON object"],
      [{ body: { requestId: "bad", scheduledAt: Date.now() } }, "Valid request ID is required"],
      [{ body: { requestId: validId } }, "A valid scheduled time is required"],
    ];

    for (const [overrides, message] of cases) {
      const res = response();
      await sessionController.createSession(request(overrides), res);

      assertErrorResponse(res, 400, message);
    }
  });

  it("rejects invalid session update IDs", async () => {
    const invalidIdResponse = response();
    await sessionController.updateSession(
      request({ params: { id: "bad" }, body: { status: "completed" } }),
      invalidIdResponse
    );

    assertErrorResponse(invalidIdResponse, 400, "Invalid session ID");
  });

  it("rejects unsupported session update fields for an authorized session", async (t) => {
    const findOne = t.mock.method(Session, "findOne", () =>
      Promise.resolve({
        mentor: validId,
        learner: "507f191e810c19729de860ea",
        status: "upcoming",
      })
    );
    const invalidFieldsResponse = response();
    await sessionController.updateSession(
      request({ params: { id: validId }, body: { unsupported: true } }),
      invalidFieldsResponse
    );

    assertErrorResponse(
      invalidFieldsResponse,
      400,
      "Invalid or unsupported session update fields"
    );
    assert.equal(findOne.mock.callCount(), 1);
  });

  it("returns not-found before validating persistence-dependent scheduling", async (t) => {
    t.mock.method(Request, "findOne", () => Promise.resolve(null));
    const res = response();

    await sessionController.createSession(
      request({
        body: { requestId: validId, scheduledAt: "not-a-date" },
      }),
      res
    );

    assertErrorResponse(res, 404, "Request not found or not authorized");
  });
});

describe("skill controller validation and errors", () => {
  it("creates a skill for the authenticated owner and returns the created skill", async (t) => {
    const skill = {
      _id: "skill-1",
      name: "JavaScript",
      description: "Frontend fundamentals",
      category: "Programming",
      level: "Beginner",
      owner: validId,
    };
    const create = t.mock.method(Skill, "create", (payload) => {
      assert.deepEqual(payload, {
        name: "JavaScript",
        description: "Frontend fundamentals",
        category: "Programming",
        level: "Beginner",
        owner: validId,
      });
      return Promise.resolve(skill);
    });
    const res = response();

    await skillController.createSkill(
      request({
        body: {
          name: "  JavaScript  ",
          description: "  Frontend fundamentals  ",
          category: "Programming",
          level: "Beginner",
        },
      }),
      res
    );

    assert.equal(create.mock.callCount(), 1);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
    assert.equal(res.result.status, 201);
  });

  it("lists skills with the requested filters, pagination, and sort", async (t) => {
    const skills = [
      {
        _id: "skill-1",
        name: "JavaScript",
        category: "Programming",
        level: "Intermediate",
        owner: { _id: validId, name: "Skill Owner" },
      },
    ];
    const populate = t.mock.fn(() => ({
      sort,
    }));
    const sort = t.mock.fn(() => ({
      skip,
    }));
    const skip = t.mock.fn(() => ({
      limit,
    }));
    const limit = t.mock.fn(() => Promise.resolve(skills));
    const find = t.mock.method(Skill, "find", () => ({ populate }));
    const countDocuments = t.mock.method(Skill, "countDocuments", () =>
      Promise.resolve(7)
    );
    const res = response();

    await skillController.getSkills(
      request({
        query: {
          name: "Java",
          category: "Programming",
          level: "Intermediate",
          page: "2",
          limit: "3",
          sort: "-createdAt",
        },
      }),
      res
    );

    const expectedFilter = {
      category: "Programming",
      level: "Intermediate",
      $or: [
        { name: { $regex: "Java", $options: "i" } },
        { description: { $regex: "Java", $options: "i" } },
      ],
    };
    assert.deepEqual(find.mock.calls[0].arguments, [expectedFilter]);
    assert.deepEqual(populate.mock.calls[0].arguments, ["owner", "name"]);
    assert.deepEqual(sort.mock.calls[0].arguments, ["-createdAt"]);
    assert.deepEqual(skip.mock.calls[0].arguments, [3]);
    assert.deepEqual(limit.mock.calls[0].arguments, [3]);
    assert.deepEqual(countDocuments.mock.calls[0].arguments, [expectedFilter]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Skills fetched successfully",
      data: skills,
      pagination: {
        page: 2,
        limit: 3,
        total: 7,
        totalPages: 3,
      },
    });
    assert.equal(res.result.status, 200);
  });

  it("returns a skill detail with its populated owner", async (t) => {
    const skill = {
      _id: validId,
      name: "Python",
      description: "Data analysis",
      category: "Data Science",
      level: "Intermediate",
      owner: { _id: "507f191e810c19729de860ea", name: "Skill Owner" },
    };
    const populate = t.mock.fn(() => Promise.resolve(skill));
    const findById = t.mock.method(Skill, "findById", () => ({ populate }));
    const res = response();

    await skillController.getSkillById(
      request({ params: { id: validId } }),
      res
    );

    assert.deepEqual(findById.mock.calls[0].arguments, [validId]);
    assert.deepEqual(populate.mock.calls[0].arguments, ["owner", "name"]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Skill fetched successfully",
      data: skill,
    });
    assert.equal(res.result.status, 200);
  });

  it("searches skills using the name and optional filters", async (t) => {
    const skills = [
      {
        _id: "skill-2",
        name: "Java",
        description: "Backend development",
        category: "Programming",
        level: "Advanced",
        owner: { _id: validId, name: "Skill Owner" },
      },
    ];
    const populate = t.mock.fn(() => Promise.resolve(skills));
    const find = t.mock.method(Skill, "find", () => ({ populate }));
    const res = response();

    await skillController.searchSkills(
      request({
        query: {
          name: "  Java  ",
          category: "Programming",
          level: "Advanced",
        },
      }),
      res
    );

    const expectedFilter = {
      category: "Programming",
      level: "Advanced",
      $or: [
        { name: { $regex: "Java", $options: "i" } },
        { description: { $regex: "Java", $options: "i" } },
      ],
    };
    assert.deepEqual(find.mock.calls[0].arguments, [expectedFilter]);
    assert.deepEqual(populate.mock.calls[0].arguments, ["owner", "name"]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Skills search completed successfully",
      data: skills,
    });
    assert.equal(res.result.status, 200);
  });

  it("rejects malformed bodies, missing owner identity, and required fields", async () => {
    const cases = [
      [{ body: [] }, 400, "Request body must be a JSON object"],
      [{ body: {} , user: {} }, 401, "Please log in with a valid account to create a skill"],
      [{ body: {}, user: { userId: validId } }, 400, "Name, description, category and level are required"],
    ];

    for (const [overrides, status, message] of cases) {
      const res = response();
      await skillController.createSkill(request(overrides), res);

      assertErrorResponse(res, status, message);
    }
  });

  it("rejects malformed and absent skill IDs", async (t) => {
    const invalidResponse = response();
    await skillController.getSkillById(request({ params: { id: "bad" } }), invalidResponse);
    assertErrorResponse(invalidResponse, 400, "Invalid skill ID");

    t.mock.method(Skill, "findById", () => ({
      populate: () => Promise.resolve(null),
    }));
    const missingResponse = response();
    await skillController.getSkillById(
      request({ params: { id: validId } }),
      missingResponse
    );

    assertErrorResponse(missingResponse, 404, "Skill not found");
  });

  it("maps unexpected skill lookup failures to a safe 500 response", async (t) => {
    const findById = t.mock.method(Skill, "findById", () => {
      throw new Error("database failure");
    });
    const res = response();

    await skillController.getSkillById(
      request({ params: { id: validId } }),
      res
    );

    assertErrorResponse(res, 500, "Failed to fetch skill");
    assert.equal(findById.mock.callCount(), 1);
  });

  it("requires a non-empty search name", async () => {
    const res = response();
    await skillController.searchSkills(request({ query: { name: " " } }), res);

    assertErrorResponse(res, 400, "Search name is required");
  });
});

describe("review controller validation and errors", () => {
  it("rejects invalid review fields before database access", async () => {
    const cases = [
      [{ body: {} }, "reviewedUser, skill and rating are required"],
      [
        { body: { reviewedUser: "bad", skill: validId, rating: 5 } },
        "Invalid user or skill ID",
      ],
      [
        { body: { reviewedUser: validId, skill: validId, rating: 6 } },
        "Rating must be an integer between 1 and 5",
      ],
      [
        {
          body: { reviewedUser: validId, skill: validId, rating: 5, comment: 10 },
        },
        "Comment must be a string",
      ],
    ];

    for (const [overrides, message] of cases) {
      const res = response();
      await reviewController.submitReview(request(overrides), res);

      assertErrorResponse(res, 400, message);
    }
  });

  it("rejects malformed review lookup IDs", async () => {
    const res = response();
    await reviewController.getRatingSummary(
      request({ params: { userId: "bad" } }),
      res
    );

    assertErrorResponse(res, 400, "Invalid user ID");
  });

  it("maps unexpected review lookup failures to a safe 500 response", async (t) => {
    const findById = t.mock.method(User, "findById", () => {
      throw new Error("database failure");
    });
    const res = response();

    await reviewController.getReviews(
      request({ params: { userId: validId } }),
      res
    );

    assertErrorResponse(res, 500, "Internal server error");
    assert.equal(findById.mock.callCount(), 1);
  });
});

describe("matching controller validation and errors", () => {
  it("rejects malformed match IDs", async () => {
    const res = response();
    await matchingController.getMatchDetails(
      request({ params: { id: "bad" } }),
      res
    );

    assertErrorResponse(res, 400, "Invalid user ID");
  });

  it("returns not-found for missing match users", async (t) => {
    t.mock.method(User, "findById", () => ({
      select: () => Promise.resolve(null),
    }));
    const res = response();

    await matchingController.getMatchDetails(
      request({ params: { id: validId } }),
      res
    );

    assertErrorResponse(res, 404, "User not found");
  });

  it("maps recommendation failures to a safe 500 response", async (t) => {
    const findById = t.mock.method(User, "findById", () => {
      throw new Error("database failure");
    });
    const res = response();

    await matchingController.getRecommendations(request(), res);

    assertErrorResponse(res, 500, "Failed to fetch recommendations");
    assert.equal(findById.mock.callCount(), 1);
  });
});

describe("chat controller validation and external service handling", () => {
  it("rejects invalid messages before calling the external service", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("The external service must not be called");
    });
    const cases = [
      [request({ body: {} }), "Provide between 1 and 20 chat messages"],
      [request({ body: null }), "Provide between 1 and 20 chat messages"],
      [request({ body: { messages: [] } }), "Provide between 1 and 20 chat messages"],
      [
        request({ body: { messages: Array.from({ length: 21 }, () => ({
          role: "user",
          content: "message",
        })) } }),
        "Provide between 1 and 20 chat messages",
      ],
      [
        request({ body: { messages: [{ role: "system", content: "hello" }] } }),
        "Chat messages must be valid and end with a user message",
      ],
      [
        request({ body: { messages: [{ role: "user" }] } }),
        "Chat messages must be valid and end with a user message",
      ],
      [
        request({ body: { messages: [{ role: "user", content: 42 }] } }),
        "Chat messages must be valid and end with a user message",
      ],
      [
        request({ body: { messages: [{ role: "user", content: "   " }] } }),
        "Chat messages must be valid and end with a user message",
      ],
      [
        request({
          body: {
            messages: [{ role: "user", content: "x".repeat(2001) }],
          },
        }),
        "Chat messages must be valid and end with a user message",
      ],
      [
        request({
          body: {
            messages: [
              { role: "user", content: "question" },
              { role: "assistant", content: "answer" },
            ],
          },
        }),
        "Chat messages must be valid and end with a user message",
      ],
    ];

    for (const [req, message] of cases) {
      const res = response();
      await chatController.sendChatMessage(req, res);
      assertErrorResponse(res, 400, message);
    }

    assert.equal(fetch.mock.callCount(), 0);
  });

  it("returns a trimmed reply and sends the documented Ollama payload", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => ({
      ok: true,
      json: async () => ({ message: { content: "  Tutor response  " } }),
    }));
    const res = response();

    await chatController.sendChatMessage(
      request({
        body: {
          messages: [
            { role: "assistant", content: "Earlier answer" },
            { role: "user", content: "  Explain recursion  " },
          ],
        },
      }),
      res
    );

    assert.equal(res.result.status, undefined);
    assert.deepEqual(res.result.body, {
      success: true,
      reply: "Tutor response",
    });
    assert.equal(fetch.mock.callCount(), 1);
    const [url, options] = fetch.mock.calls[0].arguments;
    const payload = JSON.parse(options.body);
    assert.equal(url, "http://localhost:11434/api/chat");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(payload.model, "llama3.2:1b");
    assert.equal(payload.stream, false);
    assert.equal(payload.messages.at(-1).role, "user");
    assert.equal(payload.messages.at(-1).content, "Explain recursion");
    assert.equal(payload.messages[0].role, "system");
  });

  it("maps an upstream non-2xx response to a safe 502", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: "private upstream failure details" }),
    }));
    const res = response();

    await chatController.sendChatMessage(
      request({ body: { messages: [{ role: "user", content: "Hello" }] } }),
      res
    );

    assertErrorResponse(
      res,
      502,
      "The AI service is temporarily unavailable. Please try again."
    );
    assert.equal(JSON.stringify(res.result.body).includes("private upstream"), false);
    assert.equal(fetch.mock.callCount(), 1);
  });

  it("returns a safe 502 when Ollama returns no usable reply", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => ({
      ok: true,
      json: async () => ({ message: { content: "   " } }),
    }));
    const res = response();

    await chatController.sendChatMessage(
      request({ body: { messages: [{ role: "user", content: "Hello" }] } }),
      res
    );

    assertErrorResponse(
      res,
      502,
      "The AI Tutor returned an empty response. Please try again."
    );
    assert.equal(fetch.mock.callCount(), 1);
  });

  it("maps an immediately rejected external request to a safe 502", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("private upstream failure details");
    });
    const res = response();

    await chatController.sendChatMessage(
      request({ body: { messages: [{ role: "user", content: "Hello" }] } }),
      res
    );

    assertErrorResponse(
      res,
      502,
      "The AI service is temporarily unavailable. Please try again."
    );
    assert.equal(JSON.stringify(res.result.body).includes("private upstream"), false);
    assert.equal(fetch.mock.callCount(), 1);
  });
});

describe("notification controller responses and model access", () => {
  it("lists notifications for the current user sorted newest-first", async (t) => {
    const notifications = [{ _id: "notification-1", isRead: false }];
    const sort = t.mock.fn(() => Promise.resolve(notifications));
    const find = t.mock.method(Notification, "find", () => ({ sort }));
    const res = response();

    await notificationController.getNotifications(request(), res);

    assert.equal(find.mock.callCount(), 1);
    assert.deepEqual(find.mock.calls[0].arguments[0], { user: validId });
    assert.equal(sort.mock.callCount(), 1);
    assert.deepEqual(sort.mock.calls[0].arguments[0], { createdAt: -1 });
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Notifications fetched successfully",
      data: { notifications },
    });
  });

  it("maps notification listing failures to a safe 500", async (t) => {
    const find = t.mock.method(Notification, "find", () => {
      throw new Error("database failure");
    });
    const res = response();

    await notificationController.getNotifications(request(), res);

    assertErrorResponse(
      res,
      500,
      "Server error while fetching notifications"
    );
    assert.equal(find.mock.callCount(), 1);
  });

  it("marks an owned notification as read", async (t) => {
    const notification = { _id: "notification-1", isRead: true };
    const findOneAndUpdate = t.mock.method(
      Notification,
      "findOneAndUpdate",
      () => Promise.resolve(notification)
    );
    const res = response();

    await notificationController.markNotificationAsRead(
      request({ params: { id: "notification-1" } }),
      res
    );

    assert.deepEqual(findOneAndUpdate.mock.calls[0].arguments, [
      { _id: "notification-1", user: validId },
      { $set: { isRead: true } },
      { new: true },
    ]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  });

  it("returns not-found when a notification is missing or unauthorized", async (t) => {
    t.mock.method(Notification, "findOneAndUpdate", () => Promise.resolve(null));
    const res = response();

    await notificationController.markNotificationAsRead(
      request({ params: { id: "notification-1" } }),
      res
    );

    assertErrorResponse(res, 404, "Notification not found");
  });

  it("maps mark-as-read database failures to a safe 500", async (t) => {
    const findOneAndUpdate = t.mock.method(
      Notification,
      "findOneAndUpdate",
      () => {
        throw new Error("database failure");
      }
    );
    const res = response();

    await notificationController.markNotificationAsRead(
      request({ params: { id: "notification-1" } }),
      res
    );

    assertErrorResponse(
      res,
      500,
      "Server error while updating notification"
    );
    assert.equal(findOneAndUpdate.mock.callCount(), 1);
  });

  it("marks only the current user's unread notifications and reports modifiedCount", async (t) => {
    const updateMany = t.mock.method(
      Notification,
      "updateMany",
      () => Promise.resolve({ modifiedCount: 3 })
    );
    const res = response();

    await notificationController.markAllNotificationsAsRead(request(), res);

    assert.deepEqual(updateMany.mock.calls[0].arguments, [
      { user: validId, isRead: false },
      { $set: { isRead: true } },
    ]);
    assert.deepEqual(res.result.body, {
      success: true,
      message: "All notifications marked as read",
      data: { updatedCount: 3 },
    });
  });

  it("maps mark-all database failures to a safe 500", async (t) => {
    const updateMany = t.mock.method(Notification, "updateMany", () => {
      throw new Error("database failure");
    });
    const res = response();

    await notificationController.markAllNotificationsAsRead(request(), res);

    assertErrorResponse(
      res,
      500,
      "Server error while updating notifications"
    );
    assert.equal(updateMany.mock.callCount(), 1);
  });
});
