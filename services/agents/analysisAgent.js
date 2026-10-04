const { analyzeScenarios } = require("../aiService");

async function runAnalysisAgent(input) {
  try {
    const analysis = await analyzeScenarios({
      decision: input.decision || {},
      goal: input.goal || {},
      currentState: input.currentState || {},
      preferences: input.preferences || {},
      studentProfile: input.studentProfile || null,
      scenarios: input.scenarios || [],
      weights: input.weights || {}
    });

    return {
      available: true,
      analysis
    };
  } catch (error) {
    return {
      available: false,
      analysis: {
        summary:
          "The simulation is available, but AI interpretation is temporarily unavailable.",
        scenarioAnalysis: [],
        keyTradeoffs: [],
        risks: [],
        opportunities: [],
        assumptions: [],
        sensitivityFactors: [],
        nextActions: []
      }
    };
  }
}

module.exports = {
  runAnalysisAgent
};
