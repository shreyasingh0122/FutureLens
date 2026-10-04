const { buildAnalysisPrompt } = require("../prompts/analysisPrompt");
const { validateAnalysis } = require("../validators/aiValidation");

function extractText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const part = response.output && response.output.flatMap(item => item.content || []).find(item => item.type === "output_text" && typeof item.text === "string");
  return part && part.text;
}

function parseProviderJson(text) {
  const candidate = String(text || "").trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(candidate); }
  catch { throw new Error("AI provider returned malformed JSON."); }
}

async function analyzeScenarios(data) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("AI provider is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(process.env.AI_API_URL || "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4.1-mini", input: buildAnalysisPrompt(data), text: { format: { type: "json_object" } } })
    });
    if (!response.ok) throw new Error("AI provider request failed.");
    const analysis = validateAnalysis(parseProviderJson(extractText(await response.json())));
    if (!analysis) throw new Error("AI provider response did not match the FutureLens schema.");
    return analysis;
  } finally { clearTimeout(timeout); }
}

module.exports = { analyzeScenarios };
