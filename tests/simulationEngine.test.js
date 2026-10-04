const test = require("node:test");
const assert = require("node:assert/strict");
const { generateScenarios } = require("../services/simulationEngine");
const { runFutureLensWorkflow } = require("../services/agentOrchestrator");

function simulationInput({ projects, hours = 8, consistency = 70 } = {}) {
  return {
    currentState: {
      career: 55,
      academics: 80,
      financial: 50,
      time: Math.round((hours / 40) * 100),
      skills: 58,
      personal: consistency
    },
    preferences: {
      career: 0.4,
      academics: 0.2,
      financial: 0.1,
      time: 0.1,
      skills: 0.1,
      personal: 0.1
    },
    studentProfile: projects === undefined ? undefined : { projects },
    selectedScenarios: ["balanced"]
  };
}

test("T-WHATIF-02: project signal changes modeled readiness deterministically", () => {
  const noProjects = generateScenarios(simulationInput({ projects: 0 })).scenarios[0];
  const threeProjects = generateScenarios(simulationInput({ projects: 3 })).scenarios[0];
  const repeatedThreeProjects = generateScenarios(simulationInput({ projects: 3 })).scenarios[0];

  assert.ok(threeProjects.overallScore > noProjects.overallScore);
  assert.equal(threeProjects.overallScore, repeatedThreeProjects.overallScore);
  assert.match(threeProjects.assumptions.at(-1), /3 current project\(s\).*9 points/);
});

test("T-WHATIF-03: project readiness signal has a fixed cap", () => {
  const fiveProjects = generateScenarios(simulationInput({ projects: 5 })).scenarios[0];
  const manyProjects = generateScenarios(simulationInput({ projects: 100 })).scenarios[0];

  assert.equal(manyProjects.overallScore, fiveProjects.overallScore);
});

test("T-WHATIF-09: hours and consistency changes update modeled outcomes deterministically", () => {
  const baseline = generateScenarios(simulationInput({ projects: 2, hours: 8, consistency: 72 })).scenarios[0];
  const changed = generateScenarios(simulationInput({ projects: 2, hours: 12, consistency: 88 })).scenarios[0];
  const repeated = generateScenarios(simulationInput({ projects: 2, hours: 12, consistency: 88 })).scenarios[0];

  assert.ok(changed.overallScore > baseline.overallScore);
  assert.deepEqual(changed, repeated);
});

test("T-WHATIF-04: simulation-only workflow skips analysis and reports that stage honestly", async () => {
  const input = {
    decision: { title: "Internship" },
    goal: { title: "Internship", type: "career", timeline: "6 months" },
    currentState: { career: 55, academics: 82, financial: 50, time: 20, skills: 60, personal: 72 },
    preferences: { careerPriority: 90, academicPriority: 50, financialPriority: 50, timePriority: 50, riskTolerance: 80 },
    studentProfile: { projects: 2, hoursPerWeek: 8, consistency: 72, skills: { dsa: 48, programming: 64, ml: 35, development: 56 } }
  };

  const result = await runFutureLensWorkflow(input, { includeAnalysis: false });

  assert.ok(result.simulation.scenarios.length >= 2);
  assert.equal(result.analysis, null);
  assert.equal(result.workflow.agents.at(-1).status, "skipped");
  assert.ok(!result.workflow.stages.includes("scenario-analysis"));
});
