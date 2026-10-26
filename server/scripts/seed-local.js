
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const skills = require("../seed/skills");
const Skill = require("../models/Skill");
const User = require("../models/User");

const LOCAL_URI = "mongodb://127.0.0.1:27017/skillbridge_dev";
const SEED_EMAIL = "seed-owner@skillbridge.local";

async function seedLocalSkills() {
  // Never allow this script to use an environment-provided database URI.
  if (process.env.MONGO_URI) {
    throw new Error(
      "Safety stop: MONGO_URI is set. Unset it before running the local seed."
    );
  }

  try {
    await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    if (mongoose.connection.host !== "127.0.0.1") {
      throw new Error("Safety stop: connected host is not the local database.");
    }

    console.log("Connected to local skillbridge_dev database.");

    let owner = await User.findOne({ email: SEED_EMAIL });

    if (!owner) {
      const randomPassword = require("crypto")
        .randomBytes(32)
        .toString("hex");

      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      owner = await User.create({
        name: "Local Seed Owner",
        email: SEED_EMAIL,
        password: hashedPassword,
        role: "student",
        isActive: true,
      });

      console.log("Created local seed owner.");
    } else {
      console.log("Local seed owner already exists.");
    }

    let inserted = 0;
    let skipped = 0;

    for (const skill of skills) {
      const exists = await Skill.findOne({ name: skill.name });

      if (exists) {
        skipped++;
        continue;
      }

      await Skill.create({
        ...skill,
        owner: owner._id,
      });

      inserted++;
    }

    console.log(`Seed complete. Inserted: ${inserted}, skipped: ${skipped}`);
  } catch (error) {
    console.error("Local seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedLocalSkills();
