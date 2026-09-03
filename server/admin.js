import Skill from "./models/Skill.js";
import User from "./models/User.js";
import { auth, adminOnly, roleForEmail } from "./authMiddleware.js";
import { DEPARTMENTS, isValidDepartment } from "./departments.js";

const clean = (value, limit) => (typeof value === "string" ? value.trim().slice(0, limit) : "");

const userCard = (user, extra = {}) => ({
  id: user._id,
  sequenceId: user.sequenceId ?? null,
  name: user.name,
  email: user.email,
  location: user.location || "",
  avatar: user.avatar || "",
  bio: user.bio || "",
  headline: user.headline || "",
  phone: user.phone || "",
  skillsToTeach: user.skillsToTeach || "",
  skillsToLearn: user.skillsToLearn || "",
  role: roleForEmail(user.email),
  banned: !!user.banned,
  bannedAt: user.bannedAt || null,
  joinedAt: user.createdAt,
  updatedAt: user.updatedAt,
  ...extra,
});

export function registerAdminRoutes(app) {
  // ---- Dashboard: top-line metrics ---------------------------
  app.get("/api/admin/dashboard", auth, adminOnly, async (_req, res, next) => {
    try {
      const [totalUsers, pendingSkills, approvedSkills, rejectedSkills, featuredSkills, categoryBreakdown] = await Promise.all([
        User.countDocuments(),
        Skill.countDocuments({ status: "pending" }),
        Skill.countDocuments({ status: "approved" }),
        Skill.countDocuments({ status: "rejected" }),
        Skill.countDocuments({ status: "approved", isFeatured: true }),
        Skill.aggregate([{ $match: { status: "approved" } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
      ]);

      const countByCategory = Object.fromEntries(categoryBreakdown.map((item) => [item._id, item.count]));
      const departments = DEPARTMENTS.map((name) => ({ name, approvedSkillCount: countByCategory[name] || 0 }));

      return res.json({
        success: true,
        metrics: {
          totalUsers,
          pendingSkills,
          approvedSkills,
          rejectedSkills,
          featuredSkills,
          departmentCount: DEPARTMENTS.length,
        },
        departments,
      });
    } catch (error) { return next(error); }
  });

  // ---- All registered users (sorted by sequential ID) + departmental grouping ----
  app.get("/api/admin/users", auth, adminOnly, async (_req, res, next) => {
    try {
      const [users, approvedSkills] = await Promise.all([
        User.find().sort({ sequenceId: 1 }).lean(),
        Skill.find({ status: "approved" }).sort({ createdAt: -1 }).select("user category title createdAt").lean(),
      ]);

      const departmentByUser = new Map();
      const taughtSkillByUser = new Map();
      for (const skill of approvedSkills) {
        const key = String(skill.user);
        if (!departmentByUser.has(key)) {
          departmentByUser.set(key, skill.category);
          taughtSkillByUser.set(key, skill.title);
        }
      }

      const allUsers = [];
      const buckets = Object.fromEntries(DEPARTMENTS.map((name) => [name, []]));
      const unassigned = [];

      for (const user of users) {
        const key = String(user._id);
        const department = departmentByUser.get(key);
        const card = userCard(user, {
          department: department || "Unassigned",
          taughtSkill: taughtSkillByUser.get(key) || null,
        });
        allUsers.push(card);
        if (department && buckets[department]) buckets[department].push(card);
        else unassigned.push(card);
      }

      return res.json({
        success: true,
        users: allUsers,
        departments: DEPARTMENTS.map((name) => ({ name, users: buckets[name] })).filter((d) => d.name !== "Others" || d.users.length),
        unassigned,
        totalUsers: allUsers.length,
      });
    } catch (error) { return next(error); }
  });

  // ---- Full detail for one user: profile + every skill they've submitted,
  // any status, including what they want to LEARN in return per skill. -------
  app.get("/api/admin/users/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });

      const skills = await Skill.find({ user: user._id }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        user: userCard(user),
        skills: skills.map((skill) => ({
          id: skill._id,
          title: skill.title,
          description: skill.description,
          learnSkill: skill.learnSkill,
          category: skill.category,
          status: skill.status,
          aiReview: skill.aiReview,
          adminNote: skill.adminNote,
          createdAt: skill.createdAt,
        })),
      });
    } catch (error) { return next(error); }
  });

  app.delete("/api/admin/users/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
      if (roleForEmail(user.email) === "ADMIN") return res.status(400).json({ success: false, message: "Admin accounts cannot be deleted from here." });

      await Promise.all([
        Skill.deleteMany({ user: user._id }),
        User.deleteOne({ _id: user._id }),
      ]);

      return res.json({ success: true });
    } catch (error) { return next(error); }
  });

  // ---- Ban / unban. A banned user is force-logged-out on their next request
  // (server/authMiddleware.js checks this on every authenticated call) and
  // cannot log back in with that email until unbanned. --------------------------
  app.patch("/api/admin/users/:id/ban", auth, adminOnly, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
      if (roleForEmail(user.email) === "ADMIN") return res.status(400).json({ success: false, message: "Admin accounts cannot be banned." });

      const banned = req.body.banned === true;
      user.banned = banned;
      user.bannedAt = banned ? new Date() : null;
      await user.save();

      return res.json({ success: true, user: userCard(user) });
    } catch (error) { return next(error); }
  });

  // ---- Skill moderation queue -------------------------------------------------
  app.get("/api/admin/skills", auth, adminOnly, async (req, res, next) => {
    try {
      const filter = {};
      const status = clean(req.query.status, 20);
      if (["pending", "approved", "rejected"].includes(status)) filter.status = status;
      if (req.query.featured === "true") filter.isFeatured = true;
      const category = clean(req.query.category, 60);
      if (isValidDepartment(category)) filter.category = category;

      const skills = await Skill.find(filter)
        .sort({ createdAt: -1 })
        .populate("user", "name email location avatar sequenceId");
      return res.json({ success: true, skills });
    } catch (error) { return next(error); }
  });

  // ---- Feature / Unfeature a skill for 'Featured This Week' -------------------
  app.patch("/api/admin/skills/:id/feature", auth, adminOnly, async (req, res, next) => {
    try {
      const skill = await Skill.findById(req.params.id).populate("user", "name email location avatar sequenceId");
      if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });

      const nextFeatured = req.body && req.body.isFeatured !== undefined ? !!req.body.isFeatured : !skill.isFeatured;
      skill.isFeatured = nextFeatured;
      skill.featuredAt = nextFeatured ? new Date() : null;
      if (nextFeatured && skill.status !== "approved") {
        skill.status = "approved";
        skill.reviewedAt = new Date();
      }
      await skill.save();

      return res.json({ success: true, isFeatured: skill.isFeatured, skill });
    } catch (error) { return next(error); }
  });

  app.patch("/api/admin/skills/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const status = clean(req.body.status, 20);
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'." });
      }

      const update = {
        status,
        adminNote: clean(req.body.adminNote, 1000),
        reviewedBy: req.auth.sub,
        reviewedAt: new Date(),
      };

      const category = clean(req.body.category, 60);
      if (category) {
        if (!isValidDepartment(category)) return res.status(400).json({ success: false, message: "Invalid department." });
        update.category = category;
      }

      const skill = await Skill.findByIdAndUpdate(req.params.id, update, { returnDocument: "after", runValidators: true }).populate("user", "name email location avatar sequenceId");
      if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });
      return res.json({ success: true, skill });
    } catch (error) { return next(error); }
  });

  app.delete("/api/admin/skills/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const skill = await Skill.findByIdAndDelete(req.params.id);
      if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });
      return res.json({ success: true });
    } catch (error) { return next(error); }
  });
}
