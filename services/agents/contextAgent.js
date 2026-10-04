function runContextAgent(input) {
  const decision = input.decision || {};
  const goal = input.goal || {};
  const currentState = input.currentState || {};
  const preferences = input.preferences || {};
  const numeric = (value, fallback = 50) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const sourceProfile = input.studentProfile && typeof input.studentProfile === "object" && !Array.isArray(input.studentProfile)
    ? input.studentProfile
    : null;
  const profileNumber = (value, min, max, fallback = 0) => Math.max(min, Math.min(max, numeric(value, fallback)));
  const profileSkills = sourceProfile?.skills && typeof sourceProfile.skills === "object" && !Array.isArray(sourceProfile.skills)
    ? sourceProfile.skills
    : {};
  const profileList = value => Array.isArray(value) ? value.filter(item => typeof item === "string").slice(0, 12).map(item => item.trim().slice(0, 120)).filter(Boolean) : [];
  const studentProfile = sourceProfile ? {
    goalType: typeof sourceProfile.goalType === "string" ? sourceProfile.goalType.slice(0, 40) : "",
    specificGoalId: typeof sourceProfile.specificGoalId === "string" ? sourceProfile.specificGoalId.slice(0, 100) : "",
    timeline: typeof sourceProfile.timeline === "string" ? sourceProfile.timeline.slice(0, 40) : "",
    academicYear: typeof sourceProfile.academicYear === "string" ? sourceProfile.academicYear.slice(0, 30) : numeric(sourceProfile.academicYear, null),
    cgpa: profileNumber(sourceProfile.cgpa, 0, 10),
    projects: profileNumber(sourceProfile.projects, 0, 100),
    skills: Object.fromEntries(["dsa", "programming", "ml", "development"].map(skill => [skill, profileNumber(profileSkills[skill], 0, 100)])),
    hoursPerWeek: profileNumber(sourceProfile.hoursPerWeek, 0, 40),
    priorities: profileList(sourceProfile.priorities),
    tradeoffs: profileList(sourceProfile.tradeoffs),
    consistency: profileNumber(sourceProfile.consistency, 0, 100),
    riskPreference: ["safe", "balanced", "high-growth"].includes(sourceProfile.riskPreference) ? sourceProfile.riskPreference : "balanced",
    constraints: profileList(sourceProfile.constraints),
    additionalNotes: typeof sourceProfile.additionalNotes === "string" ? sourceProfile.additionalNotes.slice(0, 600) : ""
  } : null;

  return {
    decision: {
      title: String(decision.title || "Untitled decision").trim(),
      description: String(decision.description || "").trim()
    },

    goal: {
      title: String(goal.title || "").trim(),
      description: String(goal.description || "").trim(),
      type: String(goal.type || "").trim().slice(0, 40),
      timeline: String(goal.timeline || "").trim().slice(0, 40)
    },

    currentState: {
      career: numeric(currentState.career),
      academics: numeric(currentState.academics),
      financial: numeric(currentState.financial),
      time: numeric(currentState.time),
      skills: numeric(currentState.skills),
      personal: numeric(currentState.personal)
    },

    preferences: {
      careerPriority: numeric(preferences.careerPriority),
      academicPriority: numeric(preferences.academicPriority),
      financialPriority: numeric(preferences.financialPriority),
      timePriority: numeric(preferences.timePriority),
      riskTolerance: numeric(preferences.riskTolerance)
    },

    studentProfile,

    contextReady: true
  };
}

module.exports = {
  runContextAgent
};
