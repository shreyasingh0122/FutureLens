const http = require("http");
const fs = require("fs");
const path = require("path");
const { analyzeScenarios } = require("./services/aiService");
const { runFutureLensWorkflow } = require("./services/agentOrchestrator");
const { validateAnalyzeRequest } = require("./validators/aiValidation");

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  });
}

loadLocalEnv();

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_BODY_BYTES = 100 * 1024;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    request.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      body += chunk;
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("Request body must be valid JSON.")); }
    });
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const requested = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filename = path.normalize(path.join(ROOT, requested));
  const relative = path.relative(ROOT, filename);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
    response.writeHead(404); response.end("Not found"); return;
  }
  response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filename)] || "application/octet-stream" });
  fs.createReadStream(filename).pipe(response);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/ai/simulate") {
  try {
    const input = await readJson(request);

    const validation = validateAnalyzeRequest(input);

    if (!validation.valid) {
      sendJson(response, 400, {
        success: false,
        simulationAvailable: false,
        aiAvailable: false,
        message: validation.message
      });
      return;
    }

    const isWhatIfRequest = input.mode === "what-if";
    const result = await runFutureLensWorkflow(input, {
      includeAnalysis: !isWhatIfRequest
    });

    sendJson(response, 200, {
      success: true,
      simulationAvailable: true,
      aiAvailable: !isWhatIfRequest && result.analysis?.summary
        ? result.analysis.scenarioAnalysis.length > 0
        : false,
      result
    });
  } catch (error) {
    const status =
      error.message === "Request body is too large." ||
      error.message === "Request body must be valid JSON."
        ? 400
        : 500;

    sendJson(response, status, {
      success: false,
      simulationAvailable: false,
      aiAvailable: false,
      message:
        status === 400
          ? error.message
          : "FutureLens simulation could not be completed."
    });
  }

  return;
}
  if (request.method === "POST" && request.url === "/api/ai/analyze") {
    try {
      const input = await readJson(request);
      const validation = validateAnalyzeRequest(input);
      if (!validation.valid) {
        sendJson(response, 400, { success: false, simulationAvailable: true, aiAvailable: false, message: validation.message });
        return;
      }
      const analysis = await analyzeScenarios(input);
      sendJson(response, 200, { success: true, simulationAvailable: true, aiAvailable: true, analysis });
    } catch (error) {
      // Do not include provider details or profile data in the response/logs.
      const invalidRequest = error.message === "Request body is too large." || error.message === "Request body must be valid JSON.";
      sendJson(response, invalidRequest ? 400 : 200, {
        success: !invalidRequest,
        simulationAvailable: true,
        aiAvailable: false,
        message: invalidRequest ? error.message : "AI analysis is temporarily unavailable. Your simulation is still available."
      });
    }
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") serveStatic(request, response);
  else sendJson(response, 405, { message: "Method not allowed" });
});

server.listen(PORT, () => console.log(`FutureLens is running at http://localhost:${PORT}`));
