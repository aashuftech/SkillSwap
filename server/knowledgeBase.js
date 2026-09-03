// SkillSwap knowledge base for the AI skill-review RAG pipeline.
// Each entry is an independent, retrievable chunk of text. server/rag.js
// indexes these with TF-IDF and retrieves the top-K chunks most similar
// to a submitted skill (title + description) before calling the LLM.
//
// Chunk types:
//  - category_definition : what a department covers
//  - category_examples    : concrete valid skills that belong there
//  - spam_rule             : reasons to reject / flag a submission
//  - classification_rule   : general guidance for picking a category

export const KNOWLEDGE_BASE = [
  // ---- Web Development -------------------------------------------------
  {
    id: "def-web-dev",
    type: "category_definition",
    category: "Web Development",
    text: "Web Development covers building, styling, and programming websites and web applications: front-end frameworks like React, Vue, or Angular, back-end runtimes like Node.js, Django, or Ruby on Rails, databases, APIs, and browser fundamentals like HTML, CSS, and JavaScript.",
  },
  {
    id: "ex-web-dev",
    type: "category_examples",
    category: "Web Development",
    text: "Valid Web Development skills: React fundamentals, building REST APIs with Node and Express, responsive CSS layouts with Flexbox and Grid, MongoDB for beginners, full-stack JavaScript, WordPress site building, debugging JavaScript, Git and GitHub workflows for developers.",
  },

  // ---- Graphic Design ----------------------------------------------------
  {
    id: "def-graphic-design",
    type: "category_definition",
    category: "Graphic Design",
    text: "Graphic Design covers visual communication using tools like Adobe Photoshop, Illustrator, and InDesign: logo design, branding, typography, print layout, digital illustration, and photo editing.",
  },
  {
    id: "ex-graphic-design",
    type: "category_examples",
    category: "Graphic Design",
    text: "Valid Graphic Design skills: logo design in Illustrator, Photoshop photo retouching, brand identity design, poster and flyer layout, digital painting basics, typography fundamentals, packaging design.",
  },

  // ---- UI/UX Design -------------------------------------------------------
  {
    id: "def-uiux",
    type: "category_definition",
    category: "UI/UX Design",
    text: "UI/UX Design covers user interface and user experience design: wireframing, prototyping in Figma or Adobe XD, usability testing, interaction design, design systems, and accessibility for digital products.",
  },
  {
    id: "ex-uiux",
    type: "category_examples",
    category: "UI/UX Design",
    text: "Valid UI/UX Design skills: Figma prototyping for beginners, mobile app UX design, wireframing and user flows, design systems and component libraries, usability testing basics, conducting user research interviews.",
  },

  // ---- Content Writing ----------------------------------------------------
  {
    id: "def-content-writing",
    type: "category_definition",
    category: "Content Writing",
    text: "Content Writing covers producing written content: blog posts, articles, copywriting, technical writing, editing, storytelling, scriptwriting, and content strategy.",
  },
  {
    id: "ex-content-writing",
    type: "category_examples",
    category: "Content Writing",
    text: "Valid Content Writing skills: blog writing for beginners, persuasive copywriting, technical documentation writing, editing and proofreading, freelance article writing, scriptwriting for YouTube videos, grant and proposal writing.",
  },

  // ---- SEO & Digital Marketing --------------------------------------------
  {
    id: "def-seo",
    type: "category_definition",
    category: "SEO & Digital Marketing",
    text: "SEO & Digital Marketing covers search engine optimization, keyword research, on-page and technical SEO, link building, social media marketing, email marketing, paid ads, and analytics tools like Google Analytics and Search Console.",
  },
  {
    id: "ex-seo",
    type: "category_examples",
    category: "SEO & Digital Marketing",
    text: "Valid SEO & Digital Marketing skills: on-page SEO fundamentals, keyword research with real tools, technical SEO audits, Google Ads basics, social media content strategy, email marketing automation, Google Analytics reporting.",
  },

  // ---- Data Science & Analytics --------------------------------------------
  {
    id: "def-data-science",
    type: "category_definition",
    category: "Data Science & Analytics",
    text: "Data Science & Analytics covers data analysis, statistics, machine learning, Python or R for data work, SQL, data visualization, and spreadsheet-based analytics like Excel or Google Sheets.",
  },
  {
    id: "ex-data-science",
    type: "category_examples",
    category: "Data Science & Analytics",
    text: "Valid Data Science & Analytics skills: Python for data analysis with pandas, SQL for beginners, machine learning fundamentals, Excel dashboards and pivot tables, data visualization with Tableau or Power BI, statistics for analysts.",
  },

  // ---- Photography & Video --------------------------------------------------
  {
    id: "def-photo-video",
    type: "category_definition",
    category: "Photography & Video",
    text: "Photography & Video covers photography technique, camera operation, photo and video editing, cinematography, lighting, and video production tools like Premiere Pro, Final Cut, or DaVinci Resolve.",
  },
  {
    id: "ex-photo-video",
    type: "category_examples",
    category: "Photography & Video",
    text: "Valid Photography & Video skills: portrait photography basics, DSLR camera settings, Adobe Premiere Pro editing, color grading in DaVinci Resolve, drone videography, product photography lighting, short-film editing.",
  },

  // ---- Music & Audio Production ----------------------------------------------
  {
    id: "def-music",
    type: "category_definition",
    category: "Music & Audio Production",
    text: "Music & Audio Production covers playing instruments, vocal training, music theory, songwriting, and audio production or mixing with DAWs like Ableton, FL Studio, or Logic Pro.",
  },
  {
    id: "ex-music",
    type: "category_examples",
    category: "Music & Audio Production",
    text: "Valid Music & Audio Production skills: guitar lessons for beginners, vocal training and breathing technique, music production in FL Studio, piano fundamentals, songwriting basics, mixing and mastering a track.",
  },

  // ---- Language Exchange -------------------------------------------------
  {
    id: "def-language",
    type: "category_definition",
    category: "Language Exchange",
    text: "Language Exchange covers teaching or practicing spoken and written languages: conversation practice, grammar, vocabulary, pronunciation, and exam preparation such as IELTS or TOEFL.",
  },
  {
    id: "ex-language",
    type: "category_examples",
    category: "Language Exchange",
    text: "Valid Language Exchange skills: conversational Spanish practice, English grammar for beginners, IELTS speaking preparation, French pronunciation coaching, Japanese for travelers, business English communication.",
  },

  // ---- Business & Career Coaching --------------------------------------------
  {
    id: "def-business",
    type: "category_definition",
    category: "Business & Career Coaching",
    text: "Business & Career Coaching covers resume writing, interview preparation, public speaking, entrepreneurship basics, project management, negotiation, and career mentorship. It does not include giving specific legal, medical, tax, or investment advice as a professional service.",
  },
  {
    id: "ex-business",
    type: "category_examples",
    category: "Business & Career Coaching",
    text: "Valid Business & Career Coaching skills: resume review and rewriting, mock interview practice, public speaking coaching, starting a small business fundamentals, Agile project management basics, LinkedIn profile optimization.",
  },

  // ---- Spam / invalid rules ------------------------------------------------
  {
    id: "rule-spam-generic",
    type: "spam_rule",
    category: null,
    text: "Reject submissions that are spam, gibberish, keyword stuffing, or advertisements unrelated to teaching a skill (e.g. 'buy followers cheap', 'click here for free money', random character strings).",
  },
  {
    id: "rule-illegal",
    type: "spam_rule",
    category: null,
    text: "Reject submissions describing illegal activity, hacking into systems without authorization, creating malware, academic cheating services, counterfeit goods, or circumventing security or payment systems.",
  },
  {
    id: "rule-hateful",
    type: "spam_rule",
    category: null,
    text: "Reject submissions containing hateful, harassing, discriminatory, sexual, or violent content, or content that targets a protected group.",
  },
  {
    id: "rule-professional-advice",
    type: "spam_rule",
    category: null,
    text: "Reject or flag for review submissions that present themselves as professional medical diagnosis, legal representation, or licensed financial/investment advice rather than general education (e.g. 'I will diagnose your illness', 'guaranteed stock tips', 'I am your lawyer'). General educational content about health, law, or personal finance basics is acceptable.",
  },
  {
    id: "rule-vague",
    type: "spam_rule",
    category: null,
    text: "Flag for review submissions that are too vague or impossible to teach as a concrete skill (e.g. just 'life', 'everything', 'being cool') rather than a specific, learnable ability.",
  },
  {
    id: "rule-mlm",
    type: "spam_rule",
    category: null,
    text: "Reject submissions promoting multi-level marketing recruitment, pyramid schemes, or 'get rich quick' financial schemes disguised as a skill.",
  },

  // ---- Classification guidance ----------------------------------------------
  {
    id: "rule-classify-teach-not-learn",
    type: "classification_rule",
    category: null,
    text: "A skill submission is classified by the skill the member is teaching/offering, never by the skill they want to learn in return. The 'learn' field is only extra context and must not influence the category.",
  },
  {
    id: "rule-classify-closest-fit",
    type: "classification_rule",
    category: null,
    text: "If a skill overlaps multiple departments (for example, a UI designer who also codes), classify it under the department the description most emphasizes. If it does not clearly fit any named department but is still a genuine, teachable skill, use the category 'Other' rather than rejecting it.",
  },
  {
    id: "rule-classify-confidence",
    type: "classification_rule",
    category: null,
    text: "Confidence should reflect how certain the classification and approve/reject recommendation are: high confidence (0.8-1.0) for clear, unambiguous cases; medium (0.4-0.79) when the skill is plausible but the description is thin; low (below 0.4) when the submission is ambiguous, suspicious, or borderline.",
  },
];
