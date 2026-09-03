import Skill from "./models/Skill.js";
import User from "./models/User.js";
import { auth, optionalAuth } from "./authMiddleware.js";
import { reviewSkillSubmission } from "./skillReview.js";
import { DEPARTMENTS, matchCategoryFromText } from "./departments.js";

const clean = (value, limit) => (typeof value === "string" ? value.trim().slice(0, limit) : "");

// Only fields safe to expose publicly (never leaks admin notes / reviewer ids).
const publicSkill = (skill) => {
  const userObj = skill.user && typeof skill.user === "object" ? skill.user : null;
  const ratingCount = userObj?.ratingCount ? Number(userObj.ratingCount) : 0;
  const rating = ratingCount > 0 && userObj?.rating ? Number(userObj.rating) : null;

  return {
    id: skill._id,
    title: skill.title,
    description: skill.description,
    learnSkill: skill.learnSkill,
    category: skill.category,
    status: skill.status,
    isFeatured: !!skill.isFeatured,
    featuredAt: skill.featuredAt || null,
    createdAt: skill.createdAt,
    user: userObj
      ? {
          id: userObj._id,
          name: userObj.name,
          location: userObj.location,
          avatar: userObj.avatar || "",
          rating,
          ratingCount,
        }
      : {
          name: skill.userName || "Community Member",
          avatar: "",
          rating: null,
          ratingCount: 0,
        },
  };
};

export function registerSkillRoutes(app) {
  // ---- Public featured skills (Admin-picked for Featured This Week) ----
  app.get("/api/featured", async (_req, res, next) => {
    try {
      const skills = await Skill.find({ status: "approved", isFeatured: true })
        .populate("user", "name location avatar rating ratingCount")
        .sort({ featuredAt: -1, createdAt: -1 });
      return res.json({ success: true, skills: skills.map(publicSkill) });
    } catch (error) { return next(error); }
  });

  // ---- Public categories counts (REAL live approved skills in each category) ----
  app.get("/api/categories/counts", async (_req, res, next) => {
    try {
      const taughtCounts = await Skill.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);
      const dbCounts = Object.fromEntries(taughtCounts.map((item) => [item._id, item.count]));

      const counts = {};
      DEPARTMENTS.forEach((cat) => {
        counts[cat] = dbCounts[cat] || 0;
      });

      return res.json({ success: true, counts });
    } catch (error) { return next(error); }
  });

  // ---- Submit a new skill: AI review -> auto-approved if valid ----------
  app.post("/api/skills", auth, async (req, res, next) => {
    try {
      const title = clean(req.body.title, 120);
      const description = clean(req.body.description, 2000);
      const learnSkill = clean(req.body.learnSkill, 120);
      if (!title || !description) {
        return res.status(400).json({ success: false, message: "A skill title and description are required." });
      }

      const user = req.sessionUser;
      if (!user) return res.status(401).json({ success: false, message: "Account no longer exists." });

      const aiReview = await reviewSkillSubmission({ title, description, learnSkill });
      // Status starts pending so human admin can manually review and approve
      const skill = await Skill.create({
        user: user._id,
        userEmail: user.email,
        userName: user.name,
        title,
        description,
        learnSkill,
        category: aiReview.category,
        status: "pending",
        aiReview,
      });

      return res.status(201).json({ success: true, skill });
    } catch (error) { return next(error); }
  });

  // ---- Member's own submissions (any status) ------------------------------
  app.get("/api/skills/mine", auth, async (req, res, next) => {
    try {
      const skills = await Skill.find({ user: req.auth.sub }).sort({ createdAt: -1 });
      return res.json({ success: true, skills });
    } catch (error) { return next(error); }
  });

  // ---- Public browse / search: approved only, always -----------------------
  app.get("/api/skills", optionalAuth, async (req, res, next) => {
    try {
      const filter = { status: "approved" };
      const rawCategory = clean(req.query.category, 100);
      if (rawCategory && rawCategory.toLowerCase() !== "all" && rawCategory.toLowerCase() !== "all categories") {
        const matched = DEPARTMENTS.find(
          (d) =>
            d.toLowerCase() === rawCategory.toLowerCase() ||
            d.toLowerCase().includes(rawCategory.toLowerCase()) ||
            rawCategory.toLowerCase().includes(d.toLowerCase())
        );
        filter.category = matched || rawCategory;
      }

      const search = clean(req.query.search, 120);
      if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ title: regex }, { description: regex }];
      }

      const skills = await Skill.find(filter)
        .populate("user", "name location avatar rating ratingCount")
        .sort({ createdAt: -1 })
        .limit(60);

      return res.json({ success: true, skills: skills.map(publicSkill) });
    } catch (error) { return next(error); }
  });

  // ---- Departments with live approved-skill & learner counts --------------------------
  app.get("/api/departments", async (_req, res, next) => {
    try {
      const [taughtCounts, allApprovedSkills] = await Promise.all([
        Skill.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
        Skill.find({ status: "approved" }).select("learnSkill"),
      ]);

      const countByCategory = Object.fromEntries(taughtCounts.map((item) => [item._id, item.count]));

      const learnerCounts = {};
      for (const s of allApprovedSkills) {
        if (s.learnSkill) {
          const targetCat = matchCategoryFromText(s.learnSkill, "");
          learnerCounts[targetCat] = (learnerCounts[targetCat] || 0) + 1;
        }
      }

      const departments = DEPARTMENTS.map((name) => ({
        name,
        approvedSkillCount: countByCategory[name] || 0,
        learnerCount: learnerCounts[name] || 0,
      }));

      return res.json({ success: true, departments });
    } catch (error) { return next(error); }
  });

  // ---- Public profile: a member + only their approved skills ----------------
  app.get("/api/users/:id/profile", async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "Member not found." });

      const skills = await Skill.find({ user: user._id, status: "approved" }).sort({ createdAt: -1 });
      const department = skills[0]?.category || null;

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          location: user.location,
          department,
          avatar: user.avatar || "",
          rating: user.ratingCount > 0 && user.rating ? Number(user.rating) : null,
          ratingCount: user.ratingCount || 0,
        },
        skills: skills.map((skill) => publicSkill({ ...skill.toObject(), user })),
      });
    } catch (error) { return next(error); }
  });
}
