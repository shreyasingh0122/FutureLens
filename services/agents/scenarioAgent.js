function runScenarioAgent(context) {
  const preferences = context.preferences || {};
  const currentState = context.currentState || {};

  const careerPriority = Number(preferences.careerPriority) || 50;
  const academicPriority = Number(preferences.academicPriority) || 50;
  const riskTolerance = Number(preferences.riskTolerance) || 50;

  const scenarios = [];

  // Balanced path is always available.
  scenarios.push({
    id: "balanced",
    title: "Balanced Path",
    strategy: "Distribute effort across major priorities.",
    reason:
      "Maintains progress across career, academics, skills, time, and personal priorities."
  });

  // Career-focused path becomes more relevant when career priority is high.
  if (careerPriority >= 60 || currentState.career < 70) {
    scenarios.push({
      id: "career-focused",
      title: "Career-First Path",
      strategy: "Increase investment in career development and practical skills.",
      reason:
        "Creates more room for projects, internships, networking, and skill development."
    });
  }

  // Stability-focused path becomes more relevant when academic priority is high.
  if (academicPriority >= 60) {
    scenarios.push({
      id: "stability-focused",
      title: "Stability-First Path",
      strategy: "Protect academic consistency and available personal time.",
      reason:
        "Reduces short-term pressure while maintaining academic and personal stability."
    });
  }

  // Exploratory path for users comfortable with uncertainty.
  if (riskTolerance >= 65) {
    scenarios.push({
      id: "exploration",
      title: "Exploration Path",
      strategy: "Accept more uncertainty in exchange for higher upside opportunities.",
      reason:
        "Allows experimentation with ambitious opportunities, projects, or career directions."
    });
  }

  return {
    scenarios: scenarios.slice(0, 4),
    selectionBasis: {
      careerPriority,
      academicPriority,
      riskTolerance
    }
  };
}

module.exports = {
  runScenarioAgent
};