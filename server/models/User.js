import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Stable, human-facing sequential ID (#1, #2, ...). Assigned once at
    // creation via server/models/Counter.js and never reused, even after
    // this user is deleted — see server/server.js and the startup backfill.
    sequenceId: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: true, select: false },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 1000 },
    headline: { type: String, default: "", maxlength: 160 },
    phone: { type: String, default: "", maxlength: 30 },
    skillsToTeach: { type: String, default: "", maxlength: 300 },
    skillsToLearn: { type: String, default: "", maxlength: 300 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 },
    totalRatingStars: { type: Number, default: 0 },
    // New registrations are never allowed to choose an elevated role, and
    // this stored field is never trusted for authorization either — the
    // server always re-derives the real role from ADMIN_EMAIL(S) at login
    // and on every authenticated request (see server/authMiddleware.js).
    // It is kept in sync purely so admin listings can display it cheaply.
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER", index: true },
    banned: { type: Boolean, default: false, index: true },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
