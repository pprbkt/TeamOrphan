import { parseJsonArray } from "./utils";

export interface MatchBreakdownItem {
  category: "Skills" | "Event Category" | "Location & Mode" | "Availability" | "Interests";
  matched: boolean;
  score: number;
  maxScore: number;
  details: string;
}

export interface MatchResult {
  score: number; // 0 - 100
  breakdown: MatchBreakdownItem[];
  highlightTags: { tag: string; matched: boolean }[];
}

interface MatchCandidate {
  skills: string[] | string;
  interests?: string[] | string;
  location?: string | null;
  mode?: string | null;
  availability?: string | null;
  categoryPreference?: string | null;
}

interface MatchTarget {
  requiredSkills: string[] | string;
  preferredSkills?: string[] | string | null;
  category?: string | null;
  location?: string | null;
  mode?: string | null;
}

export function calculateCompatibility(
  candidate: MatchCandidate,
  target: MatchTarget
): MatchResult {
  const candidateSkills = Array.isArray(candidate.skills)
    ? candidate.skills
    : parseJsonArray(candidate.skills);
  
  const targetRequired = Array.isArray(target.requiredSkills)
    ? target.requiredSkills
    : parseJsonArray(target.requiredSkills);

  const targetPreferred = Array.isArray(target.preferredSkills)
    ? target.preferredSkills
    : parseJsonArray(target.preferredSkills);

  const candidateInterests = Array.isArray(candidate.interests)
    ? candidate.interests
    : parseJsonArray(candidate.interests);

  const allTargetSkills = [...targetRequired, ...targetPreferred];
  const breakdown: MatchBreakdownItem[] = [];
  const highlightTags: { tag: string; matched: boolean }[] = [];

  // 1. Skill Overlap (40%)
  let skillScore = 0;
  if (targetRequired.length === 0) {
    skillScore = 40;
    breakdown.push({
      category: "Skills",
      matched: true,
      score: 40,
      maxScore: 40,
      details: "No specific skills mandatory",
    });
  } else {
    const matchedRequired = targetRequired.filter((skill) =>
      candidateSkills.some(
        (cs) => cs.trim().toLowerCase() === skill.trim().toLowerCase()
      )
    );
    const matchedPreferred = targetPreferred.filter((skill) =>
      candidateSkills.some(
        (cs) => cs.trim().toLowerCase() === skill.trim().toLowerCase()
      )
    );

    // Populate highlight tags
    targetRequired.forEach((req) => {
      const isMatched = candidateSkills.some(
        (cs) => cs.trim().toLowerCase() === req.trim().toLowerCase()
      );
      highlightTags.push({ tag: req, matched: isMatched });
    });

    const reqRatio = matchedRequired.length / Math.max(1, targetRequired.length);
    const prefRatio = targetPreferred.length > 0
      ? matchedPreferred.length / targetPreferred.length
      : 0;

    const calculatedSkill = reqRatio * 32 + prefRatio * 8;
    skillScore = Math.round(calculatedSkill);

    breakdown.push({
      category: "Skills",
      matched: matchedRequired.length > 0,
      score: skillScore,
      maxScore: 40,
      details: `${matchedRequired.length}/${targetRequired.length} required skills matched (${matchedRequired.join(", ") || "None"})`,
    });
  }

  // 2. Event Category (20%)
  let categoryScore = 0;
  if (target.category) {
    const matchesCategory =
      candidate.categoryPreference?.toLowerCase() === target.category.toLowerCase() ||
      candidateInterests.some(
        (int) => int.trim().toLowerCase() === target.category?.trim().toLowerCase()
      );

    if (matchesCategory || !candidate.categoryPreference) {
      categoryScore = 20;
      highlightTags.push({ tag: target.category, matched: true });
      breakdown.push({
        category: "Event Category",
        matched: true,
        score: 20,
        maxScore: 20,
        details: `Category aligns with ${target.category}`,
      });
    } else {
      categoryScore = 5;
      highlightTags.push({ tag: target.category, matched: false });
      breakdown.push({
        category: "Event Category",
        matched: false,
        score: 5,
        maxScore: 20,
        details: `Preferred different category`,
      });
    }
  } else {
    categoryScore = 20;
    breakdown.push({
      category: "Event Category",
      matched: true,
      score: 20,
      maxScore: 20,
      details: "General category open",
    });
  }

  // 3. Location & Mode (15%)
  let locationScore = 0;
  const isOnline =
    target.mode?.toUpperCase() === "ONLINE" || candidate.mode?.toUpperCase() === "ONLINE";
  const sameLocation =
    candidate.location &&
    target.location &&
    (candidate.location.toLowerCase().includes(target.location.toLowerCase()) ||
      target.location.toLowerCase().includes(candidate.location.toLowerCase()));

  if (isOnline || candidate.mode === "ANY" || target.mode === "HYBRID" || sameLocation) {
    locationScore = 15;
    if (target.location) {
      highlightTags.push({
        tag: isOnline ? "Online" : target.location,
        matched: true,
      });
    }
    breakdown.push({
      category: "Location & Mode",
      matched: true,
      score: 15,
      maxScore: 15,
      details: isOnline ? "Online participation compatible" : "Locations match",
    });
  } else {
    locationScore = 5;
    breakdown.push({
      category: "Location & Mode",
      matched: false,
      score: 5,
      maxScore: 15,
      details: "Different location/mode",
    });
  }

  // 4. Availability (15%)
  let availabilityScore = 15;
  if (candidate.availability) {
    availabilityScore = 15;
    breakdown.push({
      category: "Availability",
      matched: true,
      score: 15,
      maxScore: 15,
      details: `Active availability: ${candidate.availability}`,
    });
  } else {
    availabilityScore = 12;
    breakdown.push({
      category: "Availability",
      matched: true,
      score: 12,
      maxScore: 15,
      details: "Immediate availability assumed",
    });
  }

  // 5. Shared Interests (10%)
  let interestScore = 0;
  if (candidateInterests.length > 0) {
    interestScore = 10;
    breakdown.push({
      category: "Interests",
      matched: true,
      score: 10,
      maxScore: 10,
      details: `Interests: ${candidateInterests.slice(0, 3).join(", ")}`,
    });
  } else {
    interestScore = 6;
    breakdown.push({
      category: "Interests",
      matched: false,
      score: 6,
      maxScore: 10,
      details: "No specific interests listed",
    });
  }

  const totalScore = Math.min(
    100,
    Math.max(10, skillScore + categoryScore + locationScore + availabilityScore + interestScore)
  );

  return {
    score: totalScore,
    breakdown,
    highlightTags,
  };
}
