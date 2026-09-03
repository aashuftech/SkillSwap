import mongoose from "mongoose";
import { DEPARTMENTS } from "../departments.js";

const aiReviewSchema = new mongoose.Schema(
  {
    recommendation: { type: String, enum: ["approve", "reject"], required: true },
    category: { type: String, enum: DEPARTMENTS, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    confidence: { type: Number, min: 0, max: 1, required: true },
    retrievedChunkIds: { type: [String], default: [] },
    model: { type: String, default: "" },
  },
  { _id: false },
);

const skillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Denormalized for fast admin-list display without a populate on every row.
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    // What the member wants in return. Context only — never used for
    // classification (see server/knowledgeBase.js classification rules).
    learnSkill: { type: String, trim: true, maxlength: 120, default: "" },

    // Category starts as the AI's suggestion and can be overridden by the
    // admin at approval time. It is set for pending skills too so the
    // admin queue and department grouping can show a suggested department
    // before a final decision is made.
    category: { type: String, enum: DEPARTMENTS, required: true },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },

    isFeatured: { type: Boolean, default: false, index: true },
    featuredAt: { type: Date, default: null },

    aiReview: { type: aiReviewSchema, required: true },

    adminNote: { type: String, trim: true, maxlength: 1000, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

skillSchema.index({ status: 1, createdAt: -1 });
skillSchema.index({ category: 1, status: 1 });
skillSchema.index({ title: "text", description: "text" });

export default mongoose.models.Skill || mongoose.model("Skill", skillSchema);
