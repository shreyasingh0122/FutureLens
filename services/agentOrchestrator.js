const { generateScenarios } = require("./simulationEngine");
const { runContextAgent } = require("./agents/contextAgent");
const { runScenarioAgent } = require("./agents/scenarioAgent");
const { runAnalysisAgent } = require("./agents/analysisAgent");

async function runFutureLensWorkflow(input, options = {}) {
  // Agent 1: Understand and normalize the user's context
  const context = runContextAgent(input);

  // Agent 2: Select the most relevant future paths
  const scenarioPlan = runScenarioAgent(context);

  // Deterministic simulation calculates consequences
  const simulation = generateScenarios({
    currentState: context.currentState,
    studentProfile: context.studentProfile,
    preferences: {
      career: context.preferences.careerPriority,
      academics: context.preferences.academicPriority,
      financial: context.preferences.financialPriority,
      time: context.preferences.timePriority,
      skills: context.preferences.careerPriority,
      personal: 100 - context.preferences.careerPriority
    },
    selectedScenarios: scenarioPlan.scenarios.map(
      scenario => scenario.id
    )
  });

  // Agent 3: Interpret the simulated futures
  const analysisResult = options.includeAnalysis === false
    ? { available: false, skipped: true, analysis: null }
    : await runAnalysisAgent({
    decision: context.decision,
    goal: context.goal,
    currentState: context.currentState,
    preferences: context.preferences,
    studentProfile: context.studentProfile,
    scenarios: simulation.scenarios,
    weights: simulation.weights
    });

  return {
    context,
    scenarioPlan,
    simulation,
    analysis: analysisResult.analysis,
    workflow: {
      status: "completed",
      stages: [
        "context",
        "scenario-selection",
        "simulation",
        ...(analysisResult.skipped ? [] : ["scenario-analysis"])
      ],
      agents: [
        {
          name: "Context Agent",
          status: "completed"
        },
        {
          name: "Scenario Agent",
          status: "completed"
        },
        {
          name: "Analysis Agent",
          status: analysisResult.skipped
            ? "skipped"
            : analysisResult.available
              ? "completed"
              : "fallback"
        }
      ]
    }
  };
}

module.exports = {
  runFutureLensWorkflow
};
