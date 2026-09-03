/**
 * Premium options on the Payments page. `amount` (in ₹) is passed
 * straight into the existing Razorpay checkout flow in Payments.jsx —
 * this file only adds the descriptive copy/feature list around it.
 */
export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Everything you need to start swapping skills.",
    features: [
      "Create your profile & list skills",
      "Browse and message other members",
      "Join unlimited skill swaps",
    ],
    cta: "Your Current Plan",
    highlighted: false,
  },
  {
    id: "boost",
    name: "Boost",
    price: "₹99",
    period: "per week",
    amount: 99,
    tagline: "Get seen first by learners searching your category.",
    features: [
      "Pinned to the top of search for 7 days",
      "Up to 3x more profile views",
      "Featured on the homepage skill grid",
    ],
    cta: "🗲 Boost My Skill Post",
    highlighted: true,
  },
  {
    id: "verified",
    name: "Verified",
    price: "₹199",
    period: "one-time",
    amount: 199,
    tagline: "A verified badge builds instant trust with new swaps.",
    features: [
      "Verified badge on your profile & cards",
      "Higher ranking in mentor recommendations",
      "Priority support from the SkillSwap team",
    ],
    cta: "Get Verified",
    highlighted: false,
  },
];
