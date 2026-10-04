const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

async function reservePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => probe.once("error", reject).listen(0, "127.0.0.1", resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  return port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Test server exited before becoming available.");
    try { if ((await fetch(url)).ok) return; } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not become available.");
}

test("T-WHATIF-01: simulation API recalculates deterministically without the AI provider", { timeout: 30000 }, async t => {
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore"
  });
  t.after(async () => {
    if (child.exitCode === null) child.kill();
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      const timeout = setTimeout(resolve, 2000);
      child.once("exit", () => { clearTimeout(timeout); resolve(); });
    });
  });
  await waitForServer(`${origin}/`, child);

  const request = projects => ({
    mode: "what-if",
    decision: { title: "Internship" },
    goal: { title: "Internship", type: "career", timeline: "6 months" },
    currentState: { career: 56, academics: 82, financial: 50, time: 20, skills: 51, personal: 72 },
    preferences: { careerPriority: 90, academicPriority: 50, financialPriority: 50, timePriority: 50, riskTolerance: 80 },
    studentProfile: {
      goalType: "career",
      specificGoalId: "internship",
      timeline: "6 months",
      academicYear: "Year 2",
      cgpa: 8.2,
      projects,
      skills: { dsa: 48, programming: 64, ml: 35, development: 56 },
      hoursPerWeek: 8,
      priorities: ["internship", "projects"],
      tradeoffs: [],
      consistency: 72,
      riskPreference: "high-growth",
      constraints: []
    }
  });

  async function simulate(body) {
    const response = await fetch(`${origin}/api/ai/simulate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    assert.equal(response.status, 200);
    return response.json();
  }

  const baseline = await simulate(request(0));
  const adjusted = await simulate(request(3));
  const repeated = await simulate(request(3));

  assert.equal(adjusted.success, true);
  assert.equal(adjusted.aiAvailable, false);
  assert.equal(adjusted.result.analysis, null);
  assert.equal(adjusted.result.workflow.agents[2].status, "skipped");
  assert.ok(!adjusted.result.workflow.stages.includes("scenario-analysis"));
  assert.equal(adjusted.result.context.studentProfile.hoursPerWeek, 8);
  assert.equal(adjusted.result.context.studentProfile.consistency, 72);

  const baselineScores = new Map(baseline.result.simulation.scenarios.map(scenario => [scenario.id, scenario.overallScore]));
  for (const scenario of adjusted.result.simulation.scenarios) {
    assert.ok(scenario.overallScore > baselineScores.get(scenario.id), `${scenario.id} should reflect the project input`);
    assert.match(scenario.assumptions.join(" "), /Portfolio assumption/);
  }
  assert.deepEqual(adjusted.result.simulation.scenarios, repeated.result.simulation.scenarios);
});
