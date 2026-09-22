// Checks the package before a release: `node scripts/check.mjs`.
// Node built-ins only. Exits 1 and lists every problem it finds.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MCP_URL = "https://ihateposting.com/mcp";
const problems = [];
const fail = (msg) => problems.push(msg);

const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
  } catch (e) {
    fail(`${rel}: not valid JSON (${e.message})`);
    return null;
  }
};

// 1. One MCP file per agent, each filling in the key its own way.
const EXPECTED = {
  "mcp.claude.json": "Bearer ${user_config.api_key}",
  "mcp.cursor.json": "Bearer ${IHATEPOSTING_API_KEY}",
  "mcp.grok.json": "Bearer ${IHATEPOSTING_API_KEY}",
};
const checkServer = (where, s, auth) => {
  if (!s) return fail(`${where}: no "ihateposting" server`);
  if (s.url !== MCP_URL) fail(`${where}: url is ${JSON.stringify(s.url)}, expected ${MCP_URL}`);
  if (s.type !== "http") fail(`${where}: type is ${JSON.stringify(s.type)}, expected "http"`);
  if (s.headers?.Authorization !== auth) fail(`${where}: Authorization is ${JSON.stringify(s.headers?.Authorization)}, expected ${JSON.stringify(auth)}`);
};
for (const [file, auth] of Object.entries(EXPECTED)) {
  const j = readJson(file);
  if (j) checkServer(file, j.mcpServers?.ihateposting, auth);
}

// 2. Each manifest points at its own MCP file, and the names agree.
const manifests = {
  ".claude-plugin/plugin.json": "./mcp.claude.json",
  ".cursor-plugin/plugin.json": "./mcp.cursor.json",
  ".grok-plugin/plugin.json": "./mcp.grok.json",
};
const versions = new Set();
for (const [file, mcp] of Object.entries(manifests)) {
  const j = readJson(file);
  if (!j) continue;
  if (j.name !== "ihateposting") fail(`${file}: name is ${JSON.stringify(j.name)}`);
  if (j.mcpServers !== mcp) fail(`${file}: mcpServers is ${JSON.stringify(j.mcpServers)}, expected ${JSON.stringify(mcp)}`);
  if (!existsSync(join(ROOT, mcp))) fail(`${file}: ${mcp} does not exist`);
  versions.add(j.version);
}
const claude = readJson(".claude-plugin/plugin.json");
const k = claude?.userConfig?.api_key;
if (claude && !(k?.sensitive === true && k?.required === true && k?.type === "string" && k?.title && k?.description)) {
  fail(".claude-plugin/plugin.json: userConfig.api_key must be a sensitive, required string with a title and description");
}
const cursor = readJson(".cursor-plugin/plugin.json");
if (cursor && !(cursor.variables?.properties?.IHATEPOSTING_API_KEY && cursor.variables?.required?.includes("IHATEPOSTING_API_KEY"))) {
  fail(".cursor-plugin/plugin.json: variables must declare IHATEPOSTING_API_KEY as required");
}
if (cursor?.author && Object.keys(cursor.author).some((x) => !["name", "email"].includes(x))) {
  fail(".cursor-plugin/plugin.json: Cursor's schema allows only name and email in author");
}
if (cursor?.logo && !existsSync(join(ROOT, cursor.logo))) fail(`.cursor-plugin/plugin.json: logo ${cursor.logo} does not exist`);
const market = readJson(".claude-plugin/marketplace.json");
if (market && !market.plugins?.some((p) => p.name === "ihateposting" && p.source === "./")) {
  fail(".claude-plugin/marketplace.json: needs the ihateposting plugin with source ./");
}
const gemini = readJson("gemini-extension.json");
if (gemini) {
  if (gemini.name !== "ihateposting") fail("gemini-extension.json: name must be ihateposting");
  checkServer("gemini-extension.json", gemini.mcpServers?.ihateposting, "Bearer ${IHATEPOSTING_API_KEY}");
  const setting = gemini.settings?.find((s) => s.envVar === "IHATEPOSTING_API_KEY");
  if (!setting?.sensitive) fail("gemini-extension.json: the IHATEPOSTING_API_KEY setting must be sensitive");
  if (gemini.mcpServers?.ihateposting?.httpUrl) fail("gemini-extension.json: httpUrl is deprecated; use url with type http");
  versions.add(gemini.version);
}
if (versions.size !== 1) fail(`manifests disagree on the version: ${[...versions].join(", ")}`);

// 3. No shared file that some directory would install with a raw placeholder.
for (const f of [".mcp.json", "mcp.json", "plugin.json"]) {
  if (existsSync(join(ROOT, f))) fail(`${f} must not exist at the root (see README, "What is in this repository")`);
}

// 4. The skill.
const SKILL = "skills/ihateposting/SKILL.md";
const raw = readFileSync(join(ROOT, SKILL));
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) fail(`${SKILL}: starts with a UTF-8 BOM, which hides the frontmatter from Gemini CLI`);
const skill = raw.toString("utf8");
if (!/^---\r?\n/.test(skill)) fail(`${SKILL}: --- must be the very first line`);
// Gemini CLI fills ${...} in extension skills from its settings — this exact
// text would put the user's real key into the model's context.
if (skill.includes("${IHATEPOSTING_API_KEY}")) fail(`${SKILL}: contains \${IHATEPOSTING_API_KEY}; write the bare name instead`);
const fm = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
const field = (name) => fm.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
if (field("name") !== "ihateposting") fail(`${SKILL}: name must be ihateposting, the folder's name`);
if (!field("description") || field("description").length > 1024) fail(`${SKILL}: description must be 1 to 1024 characters`);
if (field("compatibility").length > 500) fail(`${SKILL}: compatibility must be at most 500 characters`);

// 5. No real key anywhere.
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === ".git" || n === "node_modules") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const p of walk(ROOT)) {
  if (p.endsWith(".png")) continue;
  if (/pk_live_[0-9a-zA-Z]{6,}/.test(readFileSync(p, "utf8"))) fail(`${relative(ROOT, p)}: contains what looks like a real API key`);
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("All checks passed.");
