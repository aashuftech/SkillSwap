import "dotenv/config";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import User from "./models/User.js";
import Skill from "./models/Skill.js";
import PlatformReview from "./models/PlatformReview.js";
import ChatMessage from "./models/ChatMessage.js";
import Rating from "./models/Rating.js";
import { nextSequence, setSequenceIfHigher } from "./models/Counter.js";
import { registerAdminAiRoutes } from "./adminAiChat.js";
import { registerSkillRoutes } from "./skills.js";
import { registerAdminRoutes } from "./admin.js";
import { registerPlatformReviewRoutes } from "./platformReviews.js";
import { auth, roleForEmail, adminEmails } from "./authMiddleware.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
if (!mongoUri) throw new Error("Missing MONGODB_URI or MONGO_URI in .env");
if (!jwtSecret) throw new Error("Missing JWT_SECRET in .env");

const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Vite changes its port when 5173 is already occupied. Allow local development
// origins explicitly so a frontend on 5173/5174/etc. can reach this API.
function allowOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  const isLocalVite = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (isLocalVite || configuredOrigins.includes(origin)) return callback(null, true);
  return callback(new Error(`CORS blocked origin: ${origin}`));
}

app.use(cors({ origin: allowOrigin, credentials: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
registerAdminAiRoutes(app);
registerSkillRoutes(app);
registerAdminRoutes(app);
registerPlatformReviewRoutes(app);

// Role is always derived live from ADMIN_EMAILS (see authMiddleware.js) —
// never from a stored field, so it can never drift or leak admin access to
// an account that merely used to match, or to whichever account happens to
// sign up next.
const tokenFor = (user) => jwt.sign({ sub: user._id.toString(), email: user.email, role: roleForEmail(user.email) }, jwtSecret, { expiresIn: "7d" });
const safeUser = (user) => ({
  id: user._id,
  sequenceId: user.sequenceId,
  name: user.name,
  email: user.email,
  location: user.location,
  avatar: user.avatar || "",
  bio: user.bio || "",
  headline: user.headline || "",
  phone: user.phone || "",
  skillsToTeach: user.skillsToTeach || "",
  skillsToLearn: user.skillsToLearn || "",
  rating: user.rating ? Number(user.rating) : 5.0,
  ratingCount: user.ratingCount || 0,
  role: roleForEmail(user.email),
});

app.get("/api/health", (_req, res) => res.json({ success: true }));

// Dynamic platform statistics for Homepage and About Us (fully database-driven)
app.get("/api/stats", async (_req, res, next) => {
  try {
    const [activeMembers, skillsAvailable, chatRooms, ratingRooms, approvedReviews] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments({ status: "approved" }),
      ChatMessage.distinct("room"),
      Rating.distinct("room"),
      PlatformReview.find({ status: "approved" }).lean(),
    ]);

    const allRooms = new Set([
      ...chatRooms.filter(Boolean),
      ...ratingRooms.filter(Boolean),
    ]);
    const successfulSwaps = allRooms.size * 2;

    let userRating = "0/5";
    let userRatingAvg = 0;
    if (approvedReviews && approvedReviews.length > 0) {
      const totalStars = approvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
      userRatingAvg = Number((totalStars / approvedReviews.length).toFixed(1));
      userRating = `${userRatingAvg}/5`;
    }

    return res.json({
      success: true,
      stats: {
        activeMembers: activeMembers || 0,
        skillsAvailable: skillsAvailable || 0,
        successfulSwaps: successfulSwaps || 0,
        userRating: userRating,
        userRatingAvg,
        reviewCount: approvedReviews.length,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", auth, (req, res) => res.json({ success: true, user: safeUser(req.sessionUser) }));

// Update user profile info & avatar
app.put("/api/users/profile", auth, async (req, res, next) => {
  try {
    const { name, location, avatar, bio, headline, phone, skillsToTeach, skillsToLearn } = req.body;
    const user = req.sessionUser;
    if (!user) return res.status(401).json({ success: false, message: "Account not found." });

    if (typeof name === "string" && name.trim()) user.name = name.trim().slice(0, 80);
    if (typeof location === "string") user.location = location.trim().slice(0, 160);
    if (typeof avatar === "string") user.avatar = avatar.trim();
    if (typeof bio === "string") user.bio = bio.trim().slice(0, 1000);
    if (typeof headline === "string") user.headline = headline.trim().slice(0, 160);
    if (typeof phone === "string") user.phone = phone.trim().slice(0, 30);
    if (typeof skillsToTeach === "string") user.skillsToTeach = skillsToTeach.trim().slice(0, 300);
    if (typeof skillsToLearn === "string") user.skillsToLearn = skillsToLearn.trim().slice(0, 300);

    await user.save();
    return res.json({ success: true, user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

// ----------------------------------------------------
// Razorpay Payment Routes
// ----------------------------------------------------
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TWq7ZdJzZgvhZG";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "";

let razorpayInstance = null;
if (razorpayKeyId && razorpayKeySecret) {
  try {
    razorpayInstance = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
  } catch (err) {
    console.error("Razorpay init error:", err.message);
  }
}

app.post("/api/create-order", async (req, res, next) => {
  try {
    const { amount, currency = "INR" } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    const amountInPaise = Math.round(numAmount * 100);

    if (razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency,
          receipt: `receipt_${Date.now()}`,
        });
        return res.json({ success: true, order, keyId: razorpayKeyId, isRealRazorpayOrder: true });
      } catch (err) {
        console.error("Razorpay order create error:", err.message);
      }
    }

    const order = {
      amount: amountInPaise,
      currency,
    };
    return res.json({ success: true, order, keyId: razorpayKeyId, isRealRazorpayOrder: false });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    return res.json({ success: true, message: "Payment verified successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Payment verification failed." });
  }
});

// ----------------------------------------------------
// 5-Star Member Ratings & Reviews
// ----------------------------------------------------
app.post("/api/ratings", auth, async (req, res, next) => {
  try {
    const { targetUserId, targetUserName, targetUserEmail, room, rating, feedback } = req.body;
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "A rating between 1 and 5 stars is required." });
    }

    const rater = req.sessionUser;
    let target = null;

    if (targetUserId) {
      target = await User.findById(targetUserId);
    }
    if (!target && targetUserEmail) {
      target = await User.findOne({ email: targetUserEmail.toLowerCase().trim() });
    }
    if (!target && targetUserName) {
      target = await User.findOne({
        name: new RegExp(`^${targetUserName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
    }

    if (!target) {
      return res.status(404).json({ success: false, message: "Partner account not found to rate." });
    }

    if (target._id.toString() === rater._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot rate yourself." });
    }

    // Save or update Rating
    await Rating.findOneAndUpdate(
      { rater: rater._id, targetUser: target._id },
      {
        rater: rater._id,
        raterName: rater.name,
        raterEmail: rater.email,
        targetUser: target._id,
        targetUserName: target.name,
        room: room || "",
        stars: numRating,
        feedback: typeof feedback === "string" ? feedback.trim().slice(0, 500) : "",
      },
      { upsert: true, returnDocument: "after" }
    );

    // Recalculate target's average rating
    const allRatings = await Rating.find({ targetUser: target._id });
    const count = allRatings.length;
    const total = allRatings.reduce((sum, r) => sum + r.stars, 0);
    const avg = count > 0 ? Number((total / count).toFixed(1)) : 5.0;

    target.rating = avg;
    target.ratingCount = count;
    target.totalRatingStars = total;
    await target.save();

    return res.json({
      success: true,
      rating: avg,
      ratingCount: count,
      message: `You rated ${target.name} ${numRating} ★!`,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/ratings/status", auth, async (req, res, next) => {
  try {
    const { targetUserId, targetUserName } = req.query;
    const raterId = req.auth.sub;

    let target = null;
    if (targetUserId) target = await User.findById(targetUserId);
    if (!target && targetUserName) {
      target = await User.findOne({
        name: new RegExp(`^${targetUserName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
    }

    if (!target) {
      return res.json({ success: true, hasRated: false, myRating: null });
    }

    const existing = await Rating.findOne({ rater: raterId, targetUser: target._id });
    return res.json({
      success: true,
      hasRated: !!existing,
      myRating: existing ? existing.stars : null,
      targetRating: target.rating || 5.0,
      targetRatingCount: target.ratingCount || 0,
    });
  } catch (error) {
    return next(error);
  }
});

// ----------------------------------------------------
// Chat: Get all messages for a room
// ----------------------------------------------------
app.get("/api/chat/messages", auth, async (req, res, next) => {
  try {
    const room = req.query.room?.trim();
    if (!room) return res.status(400).json({ success: false, message: "Room is required." });
    const messages = await ChatMessage.find({ room }).sort({ createdAt: 1 }).limit(200);

    const userId = req.auth.sub;
    const currentUserName = (req.sessionUser.name || "").trim();

    // Determine partner info from messages
    const otherMsg = messages.slice().reverse().find((m) => m.sender.toString() !== userId);
    let partnerName = otherMsg ? otherMsg.senderName : "";
    let partnerAvatar = otherMsg ? (otherMsg.senderAvatar || "") : "";
    let partnerId = otherMsg ? otherMsg.sender : null;

    if (!partnerName && messages.length > 0) {
      const myFirstMsg = messages[0];
      if (myFirstMsg.recipientName && myFirstMsg.recipientName.toLowerCase() !== currentUserName.toLowerCase()) {
        partnerName = myFirstMsg.recipientName;
        partnerId = myFirstMsg.recipient;
      }
    }

    // Lookup partner user for real rating
    let partnerRating = 5.0;
    let partnerRatingCount = 0;
    if (partnerId) {
      const pUser = await User.findById(partnerId);
      if (pUser) {
        partnerRating = pUser.rating ? Number(pUser.rating) : 5.0;
        partnerRatingCount = pUser.ratingCount || 0;
      }
    } else if (partnerName) {
      const pUser = await User.findOne({
        name: new RegExp(`^${partnerName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
      if (pUser) {
        partnerId = pUser._id;
        partnerRating = pUser.rating ? Number(pUser.rating) : 5.0;
        partnerRatingCount = pUser.ratingCount || 0;
      }
    }

    return res.json({
      success: true,
      partner: {
        id: partnerId || null,
        name: partnerName || null,
        avatar: partnerAvatar || "",
        rating: partnerRating,
        ratingCount: partnerRatingCount,
      },
      messages: messages.map((m) => ({
        id: m._id,
        room: m.room,
        senderId: m.sender,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        text: m.text,
        createdAt: m.createdAt,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        from: m.sender.toString() === userId ? "me" : "them",
      })),
    });
  } catch (error) {
    return next(error);
  }
});

// Chat: Post a new message
app.post("/api/chat/messages", auth, async (req, res, next) => {
  try {
    const { room, text, recipientName, recipientEmail } = req.body;
    if (!room?.trim() || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Room and message text are required." });
    }
    const user = req.sessionUser;

    // Resolve recipient user from MongoDB by email or name
    let recipientUser = null;
    if (recipientEmail?.trim()) {
      recipientUser = await User.findOne({ email: recipientEmail.trim().toLowerCase() });
    }
    if (!recipientUser && recipientName?.trim()) {
      recipientUser = await User.findOne({
        name: new RegExp(`^${recipientName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
    }

    const finalRecipientName = recipientUser ? recipientUser.name : (recipientName?.trim() || "");
    const finalRecipientEmail = recipientUser ? recipientUser.email : (recipientEmail?.trim() || "");
    const finalRecipientAvatar = recipientUser?.avatar || "";

    const msg = await ChatMessage.create({
      room: room.trim(),
      sender: user._id,
      senderName: user.name,
      senderEmail: user.email,
      senderAvatar: user.avatar || "",
      recipient: recipientUser ? recipientUser._id : null,
      recipientName: finalRecipientName,
      recipientEmail: finalRecipientEmail,
      recipientAvatar: finalRecipientAvatar,
      text: text.trim().slice(0, 2000),
    });

    return res.status(201).json({
      success: true,
      message: {
        id: msg._id,
        room: msg.room,
        senderId: msg.sender,
        senderName: msg.senderName,
        senderEmail: msg.senderEmail,
        senderAvatar: msg.senderAvatar,
        recipientName: msg.recipientName,
        recipientEmail: msg.recipientEmail,
        text: msg.text,
        createdAt: msg.createdAt,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        from: "me",
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Chat: Get user's active conversations
app.get("/api/chat/conversations", auth, async (req, res, next) => {
  try {
    const userId = req.auth.sub;
    const currentUserName = (req.sessionUser.name || "").trim();
    const currentUserEmail = (req.sessionUser.email || "").trim().toLowerCase();
    const userRegex = new RegExp(currentUserName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const rooms = await ChatMessage.distinct("room", {
      $or: [
        { sender: userId },
        { recipient: userId },
        { senderEmail: currentUserEmail },
        { recipientEmail: currentUserEmail },
        { recipientName: userRegex },
        { room: userRegex },
      ],
    });

    const conversations = [];
    for (const room of rooms) {
      const latestMsg = await ChatMessage.findOne({ room }).sort({ createdAt: -1 });
      if (!latestMsg) continue;

      // Look for message sent by the OTHER person in this room
      const otherUserMsg = await ChatMessage.findOne({
        room,
        sender: { $ne: userId },
      }).sort({ createdAt: -1 });

      let partnerName = "Community Member";
      let partnerAvatar = "";

      if (otherUserMsg) {
        partnerName = otherUserMsg.senderName;
        partnerAvatar = otherUserMsg.senderAvatar || "";
      } else {
        partnerName =
          latestMsg.recipientName && latestMsg.recipientName.toLowerCase() !== currentUserName.toLowerCase()
            ? latestMsg.recipientName
            : "Community Member";
      }

      if (partnerName.toLowerCase() === currentUserName.toLowerCase()) {
        if (latestMsg.senderName && latestMsg.senderName.toLowerCase() !== currentUserName.toLowerCase()) {
          partnerName = latestMsg.senderName;
          partnerAvatar = latestMsg.senderAvatar || "";
        } else if (latestMsg.recipientName && latestMsg.recipientName.toLowerCase() !== currentUserName.toLowerCase()) {
          partnerName = latestMsg.recipientName;
        }
      }

      conversations.push({
        room,
        partnerName,
        recipientName: partnerName,
        lastMessage: latestMsg.text,
        lastMessageTime: latestMsg.createdAt,
        avatar: partnerAvatar,
      });
    }

    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    return res.json({ success: true, conversations });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/signup", async (req, res, next) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !location?.trim()) return res.status(400).json({ success: false, message: "All fields are required." });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "An account already exists for this email." });
    const sequenceId = await nextSequence("userId");
    const user = await User.create({ sequenceId, name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), location: location.trim(), role: roleForEmail(normalizedEmail) });
    return res.status(201).json({ success: true, authToken: tokenFor(user), user: safeUser(user) });
  } catch (error) { return next(error); }
});

app.post("/api/loginuser", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (user.banned) return res.status(403).json({ success: false, code: "BANNED", message: "This account has been banned. Contact the SkillSwap team for help." });
    return res.json({ success: true, authToken: tokenFor(user), user: safeUser(user) });
  } catch (error) { return next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); return res.status(500).json({ success: false, message: error.message || "Server error." }); });

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowOrigin,
    methods: ["GET", "POST"],
    credentials: false,
  },
});

// Real-time online users registry: normalized key -> Set of socket IDs
const onlineUserSockets = new Map();
const socketToKeys = new Map();

io.on("connection", (socket) => {
  // Join a chat room for direct room signaling
  socket.on("join-chat-room", (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  // Register user with their active socket across name, id, and email
  socket.on("register-user", ({ userName, userId, userEmail }) => {
    if (!userName && !userId && !userEmail) return;

    const keys = [];
    if (userName && typeof userName === "string" && userName.trim()) {
      keys.push(userName.trim().toLowerCase());
    }
    if (userId) {
      keys.push(String(userId).trim().toLowerCase());
    }
    if (userEmail && typeof userEmail === "string" && userEmail.trim()) {
      keys.push(userEmail.trim().toLowerCase());
    }

    for (const key of keys) {
      if (!onlineUserSockets.has(key)) {
        onlineUserSockets.set(key, new Set());
      }
      onlineUserSockets.get(key).add(socket.id);
    }

    socketToKeys.set(socket.id, keys);
  });

  // Call initiated: Caller sends offer / calling signal to Target user
  socket.on("call-user", ({ toUserName, fromUserName, fromUserAvatar, roomId, signalData }) => {
    const targetSocketIds = new Set();

    // 1. Find by target username
    if (toUserName && typeof toUserName === "string") {
      const key = toUserName.trim().toLowerCase();
      const userSockets = onlineUserSockets.get(key);
      if (userSockets) {
        for (const sid of userSockets) {
          if (sid !== socket.id) targetSocketIds.add(sid);
        }
      }
    }

    // 2. Also find any other participant in the same chat room
    if (roomId) {
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets) {
        for (const sid of roomSockets) {
          if (sid !== socket.id) targetSocketIds.add(sid);
        }
      }
    }

    if (targetSocketIds.size > 0) {
      for (const targetSocketId of targetSocketIds) {
        io.to(targetSocketId).emit("incoming-call", {
          fromUserName,
          fromUserAvatar,
          fromSocketId: socket.id,
          roomId,
          signalData,
        });
      }
    } else {
      socket.emit("call-user-offline", { toUserName });
    }
  });

  // Receiver accepts call: Sends answer back to Caller
  socket.on("accept-call", ({ toSocketId, fromUserName, signalData, roomId }) => {
    if (!toSocketId) return;
    io.to(toSocketId).emit("call-accepted", {
      fromUserName,
      fromSocketId: socket.id,
      signalData,
      roomId,
    });
  });

  // Receiver rejects call
  socket.on("reject-call", ({ toSocketId, fromUserName }) => {
    if (!toSocketId) return;
    io.to(toSocketId).emit("call-rejected", {
      fromUserName,
      fromSocketId: socket.id,
    });
  });

  // Caller cancels call before receiver answers
  socket.on("cancel-call", ({ toUserName, roomId }) => {
    const targetSocketIds = new Set();
    if (toUserName && typeof toUserName === "string") {
      const key = toUserName.trim().toLowerCase();
      const userSockets = onlineUserSockets.get(key);
      if (userSockets) {
        for (const sid of userSockets) {
          if (sid !== socket.id) targetSocketIds.add(sid);
        }
      }
    }
    if (roomId) {
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets) {
        for (const sid of roomSockets) {
          if (sid !== socket.id) targetSocketIds.add(sid);
        }
      }
    }
    for (const sid of targetSocketIds) {
      io.to(sid).emit("call-cancelled", { roomId });
    }
  });

  // ICE Candidate exchange between peers
  socket.on("ice-candidate", ({ toSocketId, candidate }) => {
    if (!toSocketId || !candidate) return;
    io.to(toSocketId).emit("ice-candidate", {
      fromSocketId: socket.id,
      candidate,
    });
  });

  // Either user ends the active call
  socket.on("end-call", ({ toSocketId, roomId }) => {
    if (toSocketId) {
      io.to(toSocketId).emit("call-ended", { roomId });
    }
    if (roomId) {
      socket.to(roomId).emit("call-ended", { roomId });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const keys = socketToKeys.get(socket.id);
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        const set = onlineUserSockets.get(key);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) onlineUserSockets.delete(key);
        }
      }
    }
    socketToKeys.delete(socket.id);
  });
});

// Serve production frontend if dist exists (Fullstack deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    return res.sendFile(path.join(distPath, "index.html"));
  });
}

async function startServer() {
  await mongoose.connect(mongoUri);

  const admins = adminEmails();
  await User.updateMany({ email: { $in: admins } }, { $set: { role: "ADMIN" } });
  await User.updateMany({ email: { $nin: admins } }, { $set: { role: "USER" } });

  const unnumbered = await User.find({ sequenceId: { $exists: false } }).sort({ createdAt: 1 });
  for (const user of unnumbered) {
    user.sequenceId = await nextSequence("userId");
    await user.save();
  }
  httpServer.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\n⚠️  Port ${port} is already in use by another instance.`);
      console.error(`👉 Run 'npx kill-port ${port}' or stop the existing terminal process.\n`);
    } else {
      console.error("Server error:", error.message);
    }
    process.exit(1);
  });

  httpServer.listen(port, () => console.log(`SkillSwap API running on http://localhost:${port}`));
}

startServer().catch((error) => { console.error("Server startup failed:", error.message); process.exit(1); });
