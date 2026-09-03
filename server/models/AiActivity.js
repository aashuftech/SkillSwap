import mongoose from "mongoose";

const aiActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    visitorId: { type: String, trim: true, maxlength: 120, index: true },
    type: { type: String, enum: ["CHAT", "SKILL_SEARCH", "SKILL_REVIEW"], required: true, index: true },
    query: { type: String, trim: true, maxlength: 3000, default: "" },
    resultCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

aiActivitySchema.index({ createdAt: -1, type: 1 });

export default mongoose.models.AiActivity || mongoose.model("AiActivity", aiActivitySchema);
