/**
 * Real database-driven stats definitions for Homepage and About Us.
 * Icon references are preserved for rendering.
 */
import { Users, Sparkles, Repeat, Star } from "lucide-react";

export const HOME_STATS = [
  { key: "activeMembers", icon: Users, value: "0", label: "Active Members" },
  { key: "skillsAvailable", icon: Sparkles, value: "0", label: "Skills Available" },
  { key: "successfulSwaps", icon: Repeat, value: "0", label: "Successful Swaps" },
  { key: "userRating", icon: Star, value: "0/5", label: "User Rating" },
];

export function formatStatsList(statsData = {}) {
  const activeMembers = statsData.activeMembers ?? 0;
  const skillsAvailable = statsData.skillsAvailable ?? 0;
  const successfulSwaps = statsData.successfulSwaps ?? 0;
  const userRating = statsData.userRating || "0/5";

  return [
    { key: "activeMembers", icon: Users, value: String(activeMembers), label: "Active Members" },
    { key: "skillsAvailable", icon: Sparkles, value: String(skillsAvailable), label: "Skills Available" },
    { key: "successfulSwaps", icon: Repeat, value: String(successfulSwaps), label: "Successful Swaps" },
    { key: "userRating", icon: Star, value: String(userRating), label: "User Rating" },
  ];
}
