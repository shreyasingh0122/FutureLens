const MAX_TEXT_LENGTH = 600;

function isObject(value) { return value && typeof value === "object" && !Array.isArray(value); }
function isStringArray(value) { return Array.isArray(value) && value.every(item => typeof item === "string"); }

function validateAnalyzeRequest(data) {
  if (
    !isObject(data) ||
    !isObject(data.decision) ||
    !isObject(data.goal) ||
    !isObject(data.currentState) ||
    !isObject(data.preferences)
  ) {
    return {
      valid: false,
      message:
        "A decision, goal, current state, and preferences are required."
    };
  }

  if (
    typeof data.decision.title !== "string" ||
    !data.decision.title.trim()
  ) {
    return {
      valid: false,
      message: "A decision title is required."
    };
  }

  const numericStateFields = [
    "career",
    "academics",
    "financial",
    "time",
    "skills",
    "personal"
  ];

  const invalidState = numericStateFields.some(
    field =>
      data.currentState[field] !== undefined &&
      (typeof data.currentState[field] !== "number" ||
        data.currentState[field] < 0 ||
        data.currentState[field] > 100)
  );

  if (invalidState) {
    return {
      valid: false,
      message:
        "Current-state values must be numbers between 0 and 100."
    };
  }

  const preferenceFields = [
    "careerPriority",
    "academicPriority",
    "financialPriority",
    "timePriority",
    "riskTolerance"
  ];

  const invalidPreferences = preferenceFields.some(
    field =>
      data.preferences[field] !== undefined &&
      (typeof data.preferences[field] !== "number" ||
        data.preferences[field] < 0 ||
        data.preferences[field] > 100)
  );

  if (invalidPreferences) {
    return {
      valid: false,
      message:
        "Preference values must be numbers between 0 and 100."
    };
  }

  if (data.studentProfile !== undefined) {
    const profile = data.studentProfile;
    if (!isObject(profile)) return { valid: false, message: "Student profile must be an object." };
    const boundedNumber = (value, min, max) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
    if (profile.cgpa !== undefined && !boundedNumber(profile.cgpa, 0, 10)) return { valid: false, message: "Student CGPA must be between 0 and 10." };
    if (profile.projects !== undefined && !boundedNumber(profile.projects, 0, 100)) return { valid: false, message: "Project count must be between 0 and 100." };
    if (profile.hoursPerWeek !== undefined && !boundedNumber(profile.hoursPerWeek, 0, 40)) return { valid: false, message: "Weekly availability must be between 0 and 40 hours." };
    if (profile.consistency !== undefined && !boundedNumber(profile.consistency, 0, 100)) return { valid: false, message: "Consistency must be between 0 and 100." };
    if (profile.academicYear !== undefined && !(typeof profile.academicYear === "string" && profile.academicYear.length <= 30) && !(typeof profile.academicYear === "number" && Number.isFinite(profile.academicYear))) return { valid: false, message: "Academic year must be a short label or number." };
    if (profile.riskPreference !== undefined && !["safe", "balanced", "high-growth"].includes(profile.riskPreference)) return { valid: false, message: "Choose a supported risk preference." };
    if (profile.additionalNotes !== undefined && (typeof profile.additionalNotes !== "string" || profile.additionalNotes.length > MAX_TEXT_LENGTH)) return { valid: false, message: "Additional notes must be 600 characters or fewer." };
    for (const field of ["goalType", "specificGoalId", "timeline"]) {
      if (profile[field] !== undefined && (typeof profile[field] !== "string" || profile[field].length > 120)) return { valid: false, message: `Student ${field} must be short text.` };
    }
    if (profile.skills !== undefined && (!isObject(profile.skills) || Object.values(profile.skills).some(value => !boundedNumber(value, 0, 100)))) return { valid: false, message: "Skill values must be numbers between 0 and 100." };
    for (const field of ["priorities", "tradeoffs", "constraints"]) {
      if (profile[field] !== undefined && (!isStringArray(profile[field]) || profile[field].length > 12 || profile[field].some(value => value.length > 120))) return { valid: false, message: `Student ${field} must be a short list of text values.` };
    }
  }

  return {
    valid: true
  };
}

function validateAnalysis(data) {
  if (!isObject(data) || typeof data.summary !== "string" || !Array.isArray(data.scenarioAnalysis)) return null;
  const stringFields = ["keyTradeoffs", "risks", "opportunities", "assumptions", "sensitivityFactors", "nextActions"];
  if (!stringFields.every(field => isStringArray(data[field]))) return null;
  if (!data.scenarioAnalysis.every(item => isObject(item) && typeof item.id === "string" && typeof item.explanation === "string" && isStringArray(item.strengths) && isStringArray(item.risks) && isStringArray(item.tradeoffs))) return null;
  const trimText = value => String(value).trim().slice(0, MAX_TEXT_LENGTH);
  const trimList = list => list.map(trimText).filter(Boolean).slice(0, 8);
  return {
    summary: trimText(data.summary),
    scenarioAnalysis: data.scenarioAnalysis.slice(0, 5).map(item => ({ id: trimText(item.id), explanation: trimText(item.explanation), strengths: trimList(item.strengths), risks: trimList(item.risks), tradeoffs: trimList(item.tradeoffs) })),
    ...Object.fromEntries(stringFields.map(field => [field, trimList(data[field])]))
  };
}

module.exports = { validateAnalyzeRequest, validateAnalysis };
