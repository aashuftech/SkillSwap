import PlatformReview from "./models/PlatformReview.js";
import Skill from "./models/Skill.js";
import { auth, adminOnly } from "./authMiddleware.js";

const clean = (value, limit = 1000) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

export function registerPlatformReviewRoutes(app) {
  // ---- Public: Get all APPROVED website reviews for homepage ----
  app.get("/api/platform-reviews", async (_req, res, next) => {
    try {
      const reviews = await PlatformReview.find({ status: "approved" })
        .sort({ approvedAt: -1, createdAt: -1 })
        .lean();

      const formatted = reviews.map((r) => {
        let role = "Skill Swapper";
        if (r.teachingSkill) {
          role = r.teachingSkill.toLowerCase().startsWith("teach")
            ? r.teachingSkill
            : `Teaches ${r.teachingSkill}`;
        }

        return {
          id: r._id,
          name: r.userName,
          role,
          teachingSkill: r.teachingSkill,
          quote: r.reviewText,
          img: r.userAvatar || "",
          rating: r.rating || 5,
          createdAt: r.createdAt,
        };
      });

      return res.json({ success: true, reviews: formatted });
    } catch (error) {
      return next(error);
    }
  });

  // ---- Authenticated User: Submit a new platform review ----
  app.post("/api/platform-reviews", auth, async (req, res, next) => {
    try {
      const user = req.sessionUser;
      if (!user) {
        return res.status(401).json({ success: false, message: "Please log in to submit a review." });
      }

      const rating = Number(req.body.rating);
      const reviewText = clean(req.body.reviewText, 1000);

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Please select a rating between 1 and 5 stars." });
      }
      if (!reviewText) {
        return res.status(400).json({ success: false, message: "Please write your review text." });
      }

      // Determine teaching skill from user's profile or approved skills in database
      let resolvedTeachingSkill = clean(user.skillsToTeach, 120);
      if (!resolvedTeachingSkill) {
        const userApprovedSkill = await Skill.findOne({ user: user._id, status: "approved" });
        if (userApprovedSkill?.title) {
          resolvedTeachingSkill = userApprovedSkill.title;
        }
      }
      if (!resolvedTeachingSkill && req.body.teachingSkill) {
        resolvedTeachingSkill = clean(req.body.teachingSkill, 120);
      }

      const review = await PlatformReview.create({
        user: user._id,
        userName: user.name,
        userAvatar: user.avatar || "",
        teachingSkill: resolvedTeachingSkill || "Member",
        rating,
        reviewText,
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Thank you for reviewing SkillSwap! Your review has been submitted and is pending admin approval.",
        review,
      });
    } catch (error) {
      return next(error);
    }
  });

  // ---- Admin Only: Get all platform reviews for moderation ----
  app.get("/api/admin/platform-reviews", auth, adminOnly, async (_req, res, next) => {
    try {
      const reviews = await PlatformReview.find()
        .populate("user", "name email avatar location")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ success: true, reviews });
    } catch (error) {
      return next(error);
    }
  });

  // ---- Admin Only: Approve or Reject a platform review ----
  app.patch("/api/admin/platform-reviews/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid review status." });
      }

      const updateData = { status };
      if (status === "approved") {
        updateData.approvedBy = req.auth.email;
        updateData.approvedAt = new Date();
      } else if (status === "rejected") {
        updateData.approvedBy = req.auth.email;
      }

      const review = await PlatformReview.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!review) {
        return res.status(404).json({ success: false, message: "Review not found." });
      }

      return res.json({
        success: true,
        message: `Review has been marked as ${status}.`,
        review,
      });
    } catch (error) {
      return next(error);
    }
  });
}
