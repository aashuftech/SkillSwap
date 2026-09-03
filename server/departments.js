// Canonical department/category taxonomy for SkillSwap.

export const DEPARTMENTS = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "SEO",
  "Digital Marketing",
  "Data Science",
  "Video Editing",
  "Language Exchange",
  "Music",
  "Others",
];

export const isValidDepartment = (value) => DEPARTMENTS.includes(value);

// Specific categories taxonomy from user rules
export const CATEGORY_RULES = [
  // 1. Mobile Development (checked before Web Development to capture React Native, Mobile UI)
  {
    category: "Mobile Development",
    keywords: [
      "react native", "flutter", "android development", "android", "kotlin", "swift",
      "dart", "firebase", "mobile ui design", "mobile ui", "ios development", "ios", "mobile app", "mobile development"
    ],
  },
  // 2. Web Development
  {
    category: "Web Development",
    keywords: [
      "html", "css", "javascript", "react.js", "reactjs", "react", "next.js", "nextjs", "node.js", "nodejs", "express.js", "expressjs", "express",
      "mongodb", "rest api", "typescript", "git & github", "git", "github", "tailwind css", "tailwind", "web development", "frontend", "backend", "full stack"
    ],
  },
  // 3. UI/UX Design
  {
    category: "UI/UX Design",
    keywords: [
      "figma", "adobe xd", "wireframing", "prototyping", "user research", "ux research",
      "user flow", "usability testing", "design systems", "ui design", "ux design", "ui/ux design", "ui/ux"
    ],
  },
  // 4. Graphic Design
  {
    category: "Graphic Design",
    keywords: [
      "photoshop", "illustrator", "canva", "logo design", "poster design", "brand design",
      "typography", "social media design", "graphic design", "vector art", "coreldraw"
    ],
  },
  // 5. Content Writing
  {
    category: "Content Writing",
    keywords: [
      "blog writing", "copywriting", "technical writing", "creative writing", "article writing",
      "storytelling", "script writing", "proofreading", "content writing", "ghostwriting"
    ],
  },
  // 6. SEO
  {
    category: "SEO",
    keywords: [
      "keyword research", "on-page seo", "off-page seo", "technical seo", "link building",
      "local seo", "seo auditing", "content seo", "seo", "search engine optimization", "backlinks"
    ],
  },
  // 7. Digital Marketing
  {
    category: "Digital Marketing",
    keywords: [
      "social media marketing", "google ads", "facebook ads", "meta ads", "email marketing",
      "content marketing", "affiliate marketing", "marketing analytics", "campaign management", "digital marketing", "ppc", "smm"
    ],
  },
  // 8. Data Science
  {
    category: "Data Science",
    keywords: [
      "python", "pandas", "numpy", "machine learning", "deep learning",
      "data visualization", "sql", "statistics", "power bi", "data analysis", "data science", "tableau", "ai/ml"
    ],
  },
  // 9. Video Editing
  {
    category: "Video Editing",
    keywords: [
      "adobe premiere pro", "premiere pro", "after effects", "davinci resolve", "capcut",
      "video color grading", "color grading", "motion graphics", "video transitions", "youtube video editing", "video editing", "final cut pro"
    ],
  },
  // 10. Language Exchange
  {
    category: "Language Exchange",
    keywords: [
      "english", "hindi", "spanish", "french", "german", "japanese", "korean", "chinese",
      "italian", "arabic", "language exchange", "spoken english", "language tutor"
    ],
  },
  // 11. Music
  {
    category: "Music",
    keywords: [
      "guitar", "piano", "singing", "music production", "music theory", "drums",
      "songwriting", "beat making", "djing", "music", "vocals", "keyboard", "flute"
    ],
  },
  // 12. Others
  {
    category: "Others",
    keywords: [
      "public speaking", "cooking", "photography", "fitness training", "personal finance",
      "career guidance", "interview preparation", "drawing", "painting", "chess", "time management", "communication skills"
    ],
  },
];

export function matchCategoryFromText(title = "", description = "") {
  const fullText = `${title} ${description}`.toLowerCase();
  const titleLower = title.trim().toLowerCase();

  const allKeywords = [];
  CATEGORY_RULES.forEach((rule) => {
    rule.keywords.forEach((kw) => {
      allKeywords.push({ keyword: kw.toLowerCase(), category: rule.category, len: kw.length });
    });
  });
  allKeywords.sort((a, b) => b.len - a.len);

  // 1. Direct title exact matches
  for (const item of allKeywords) {
    if (titleLower === item.keyword) {
      return item.category;
    }
  }

  // 2. Full text substring / boundary matches
  for (const item of allKeywords) {
    const regex = new RegExp(`\\b${item.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(fullText) || fullText.includes(item.keyword)) {
      return item.category;
    }
  }

  return "Others";
}
