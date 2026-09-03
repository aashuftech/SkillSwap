import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, trim: true, maxlength: 8000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visitorId: { type: String, trim: true, maxlength: 120 },
    messages: { type: [messageSchema], default: [] },
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

aiConversationSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });
aiConversationSchema.index({ visitorId: 1 }, { unique: true, partialFilterExpression: { visitorId: { $type: "string" } } });

export default mongoose.models.AiConversation || mongoose.model("AiConversation", aiConversationSchema);
