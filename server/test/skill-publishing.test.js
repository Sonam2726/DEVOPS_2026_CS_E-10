const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const skillController = require("../controllers/skillController");
const Skill = require("../models/Skill");

const ownerId = "507f1f77bcf86cd799439011";

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

describe("skill publishing visibility", () => {
  it("lists only skills owned by the authenticated account", async (t) => {
    const expectedSkills = [{ _id: "skill-1", owner: ownerId, name: "Python" }];
    const sort = t.mock.fn(() => Promise.resolve(expectedSkills));
    const populate = t.mock.fn(() => ({ sort }));
    const find = t.mock.method(Skill, "find", () => ({ populate }));
    const res = response();

    await skillController.getMySkills(
      { user: { userId: ownerId } },
      res
    );

    assert.deepEqual(find.mock.calls[0].arguments, [{ owner: ownerId }]);
    assert.deepEqual(populate.mock.calls[0].arguments, ["owner", "name"]);
    assert.deepEqual(sort.mock.calls[0].arguments, [{ createdAt: -1 }]);
    assert.deepEqual(res.result.body.data, expectedSkills);
    assert.equal(res.result.status, 200);
  });
});
