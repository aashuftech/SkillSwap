import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true, trim: true },
    senderEmail: { type: String, default: "", lowercase: true, trim: true, index: true },
    senderAvatar: { type: String, default: "" },

    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    recipientName: { type: String, default: "", trim: true },
    recipientEmail: { type: String, default: "", lowercase: true, trim: true, index: true },
    recipientAvatar: { type: String, default: "" },

    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

chatMessageSchema.index({ room: 1, createdAt: 1 });
chatMessageSchema.index({ sender: 1, recipient: 1 });
chatMessageSchema.index({ senderEmail: 1, recipientEmail: 1 });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
