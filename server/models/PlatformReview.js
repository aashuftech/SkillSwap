import mongoose from "mongoose";

const platformReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    teachingSkill: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformReview ||
  mongoose.model("PlatformReview", platformReviewSchema);
