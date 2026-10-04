const DEFAULT_WEIGHTS = {
  career: 0.25,
  academics: 0.20,
  financial: 0.15,
  time: 0.15,
  skills: 0.15,
  personal: 0.10
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function normalizeWeights(weights = {}) {
  const merged = { ...DEFAULT_WEIGHTS };

  for (const key of Object.keys(DEFAULT_WEIGHTS)) {
    if (weights[key] !== undefined) {
      merged[key] = Math.max(0, Number(weights[key]) || 0);
    }
  }

  const total = Object.values(merged).reduce(
    (sum, value) => sum + value,
    0
  );

  if (!total) {
    return { ...DEFAULT_WEIGHTS };
  }

  return Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [
      key,
      Number((value / total).toFixed(4))
    ])
  );
}

function calculateMetrics({
  career = 50,
  academics = 50,
  financial = 50,
  time = 50,
  skills = 50,
  personal = 50
}) {
  return {
    career: Math.round(clamp(career)),
    academics: Math.round(clamp(academics)),
    financial: Math.round(clamp(financial)),
    time: Math.round(clamp(time)),
    skills: Math.round(clamp(skills)),
    personal: Math.round(clamp(personal))
  };
}

function calculateOverall(metrics, weights) {
  return Math.round(
    Object.entries(metrics).reduce(
      (total, [key, value]) => total + value * weights[key],
      0
    )
  );
}

function buildScenario({
  id,
  title,
  description,
  baseMetrics,
  adjustments = {},
  assumptions = []
}) {
  const metrics = calculateMetrics(
    Object.fromEntries(
      Object.entries(baseMetrics).map(([key, value]) => [
        key,
        value + (Number(adjustments[key]) || 0)
      ])
    )
  );

  return {
    id,
    title,
    description,
    metrics,
    assumptions,
    overallScore: 0
  };
}

function generateScenarios(input) {
  const state = input.currentState || {};
  const preferences = input.preferences || {};
  const selectedScenarios = input.selectedScenarios || [
    "balanced",
    "career-focused",
    "stability-focused"
  ];

  const baseMetrics = calculateMetrics({
    career: state.career ?? 50,
    academics: state.academics ?? 50,
    financial: state.financial ?? 50,
    time: state.time ?? 50,
    skills: state.skills ?? 50,
    personal: state.personal ?? 50
  });

  // Transparent portfolio signal: every current project adds 3 points to
  // modeled career and skill readiness, capped at 15. This is a deterministic
  // scenario assumption, not a hiring probability or outcome guarantee.
  const projectCount = Number(input.studentProfile?.projects);
  const projectSignal = input.studentProfile && Number.isFinite(projectCount)
    ? Math.min(15, Math.max(0, projectCount) * 3)
    : 0;
  baseMetrics.career = Math.min(100, baseMetrics.career + projectSignal);
  baseMetrics.skills = Math.min(100, baseMetrics.skills + projectSignal);
  const projectAssumption = projectSignal > 0
    ? [`Portfolio assumption: ${Math.round(projectSignal / 3)} current project(s) add ${projectSignal} points to the career and skill signals (15-point cap).`]
    : [];

  const weights = normalizeWeights(preferences);

  const scenarioDefinitions = {
    balanced: {
      id: "balanced",
      title: "Balanced Path",
      description:
        "A moderate approach that distributes effort across competing priorities.",
      adjustments: {
        career: 5,
        academics: 5,
        skills: 5,
        time: 0,
        personal: 5
      },
      assumptions: [
        "Effort is distributed across multiple priorities.",
        "No single priority dominates the decision."
      ]
    },

    "career-focused": {
      id: "career-focused",
      title: "Career-First Path",
      description:
        "A path that prioritizes career development and practical skill growth.",
      adjustments: {
        career: 15,
        skills: 15,
        academics: -5,
        time: -10,
        personal: -5
      },
      assumptions: [
        "More time is allocated to career development.",
        "Short-term academic or personal flexibility may decrease."
      ]
    },

    "stability-focused": {
      id: "stability-focused",
      title: "Stability-First Path",
      description:
        "A path that prioritizes academic consistency, available time, and personal flexibility.",
      adjustments: {
        career: -5,
        skills: 0,
        academics: 15,
        time: 10,
        personal: 10
      },
      assumptions: [
        "The user protects existing commitments.",
        "Career acceleration may be slower in the short term."
      ]
    },

    exploration: {
      id: "exploration",
      title: "Exploration Path",
      description:
        "A higher-uncertainty path that prioritizes experimentation and potential upside.",
      adjustments: {
        career: 20,
        skills: 20,
        academics: -10,
        time: -15,
        personal: -5
      },
      assumptions: [
        "The user accepts greater uncertainty.",
        "More effort is invested in experimentation and opportunity discovery.",
        "Short-term stability may decrease."
      ]
    }
  };

  const scenarios = selectedScenarios
    .filter(id => scenarioDefinitions[id])
    .map(id => {
      const definition = scenarioDefinitions[id];

      return buildScenario({
        id: definition.id,
        title: definition.title,
        description: definition.description,
        baseMetrics,
        adjustments: definition.adjustments,
        assumptions: [...definition.assumptions, ...projectAssumption]
      });
    });

  for (const scenario of scenarios) {
    scenario.overallScore = calculateOverall(
      scenario.metrics,
      weights
    );
  }

  return {
    scenarios,
    weights
  };
}

module.exports = {
  generateScenarios,
  calculateMetrics,
  calculateOverall,
  normalizeWeights
};
