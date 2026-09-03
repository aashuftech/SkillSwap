import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    raterName: { type: String, default: "" },
    raterEmail: { type: String, default: "" },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetUserName: { type: String, default: "" },
    room: { type: String, default: "", index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

// One rating per rater per targetUser
ratingSchema.index({ rater: 1, targetUser: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model("Rating", ratingSchema);
