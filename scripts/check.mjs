// Checks the package before a release: `node scripts/check.mjs`.
// Node built-ins only. Exits 1 and lists every problem it finds.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MCP_URL = "https://ihateposting.com/mcp";
/* The same server, reached the other way: this endpoint answers 401 with a
   WWW-Authenticate pointing at our protected-resource metadata, which is how
   an OAuth client finds the sign-in. Used by Gemini CLI — see below. */
const OAUTH_MCP_URL = "https://ihateposting.com/mcp/oauth";
const problems = [];
const fail = (msg) => problems.push(msg);

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === ".git" || n === "node_modules") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

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
/* Gemini CLI is the one agent here that must NOT be handed the API key.
   Its MCP header values are expanded against a SANITIZED environment
   (gemini-cli packages/core/src/tools/mcp-client.ts, createTransportRequestInit),
   and packages/core/src/services/environmentSanitization.ts redacts any
   variable whose NAME matches /KEY/i — which IHATEPOSTING_API_KEY does. A
   redacted variable expands to "", so `Bearer ${IHATEPOSTING_API_KEY}` went
   out as a bare "Bearer " and every call 401'd. Nothing in Google's own docs
   mentions this; their worked example hardcodes the token.

   So this extension signs in with OAuth, which Gemini CLI discovers from the
   RFC 9728 metadata we already serve. `oauth.enabled` is not decoration:
   mcp-client.ts only starts the flow by itself when it is true ("Only trigger
   automatic OAuth if explicitly enabled in config"); without it the user is
   left to run `/mcp auth ihateposting` by hand. */
const gemini = readJson("gemini-extension.json");
if (gemini) {
  if (gemini.name !== "ihateposting") fail("gemini-extension.json: name must be ihateposting");
  const g = gemini.mcpServers?.ihateposting;
  if (!g) {
    fail('gemini-extension.json: no "ihateposting" server');
  } else {
    if (g.url !== OAUTH_MCP_URL) fail(`gemini-extension.json: url is ${JSON.stringify(g.url)}, expected ${OAUTH_MCP_URL}`);
    if (g.type !== "http") fail(`gemini-extension.json: type is ${JSON.stringify(g.type)}, expected "http"`);
    if (g.oauth?.enabled !== true) fail("gemini-extension.json: oauth.enabled must be true, or Gemini CLI never starts the sign-in itself");
    if (g.headers) fail("gemini-extension.json: no headers — a ${...} naming a KEY/TOKEN/SECRET/AUTH is blanked by Gemini CLI's environment redaction and ships as an empty credential");
    if (g.httpUrl) fail("gemini-extension.json: httpUrl is deprecated; use url with type http");
  }
  if (gemini.settings) fail("gemini-extension.json: no settings — signing in with OAuth means there is no key for anyone to paste");
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

// 5. The docs name exactly the product's tools and networks. Update these two
// lists whenever the MCP server changes (packages/mcp/src/tools.ts upstream).
const TOOLS = [
  "whoami", "list_accounts", "get_platform_rules", "validate_post", "create_post", "list_posts", "get_post",
  "update_post", "reschedule_post", "retry_post", "delete_post", "list_media", "upload_media",
  "list_pinterest_boards", "get_analytics",
];
const NETWORKS = ["Bluesky", "X", "LinkedIn", "Facebook", "Threads", "Mastodon", "Telegram", "Discord", "Tumblr", "Slack", "Instagram", "Pinterest", "TikTok", "YouTube"];
const readme = existsSync(join(ROOT, "README.md")) ? readFileSync(join(ROOT, "README.md"), "utf8") : "";
for (const t of TOOLS) if (!readme.includes(`\`${t}\``)) fail(`README.md: does not list the \`${t}\` tool`);
for (const n of NETWORKS) if (!new RegExp(`\\b${n}\\b`).test(readme)) fail(`README.md: does not mention ${n}`);
// A backticked tool-shaped name in the skill must be a real tool.
const toolShaped = /`((?:get|list|create|update|delete|retry|reschedule|upload|validate|publish|schedule|cancel|unschedule|remove|send)_[a-z_]+|whoami)`/g;
for (const f of walk(join(ROOT, "skills")).filter((p) => p.endsWith(".md"))) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(toolShaped)) if (!TOOLS.includes(m[1])) fail(`${relative(ROOT, f)}: names \`${m[1]}\`, which is not an iHatePosting tool`);
  // Same leak as SKILL.md: Gemini CLI fills \${...} in every skill file it loads.
  if (text.includes("${IHATEPOSTING_API_KEY}")) fail(`${relative(ROOT, f)}: contains \${IHATEPOSTING_API_KEY}; write the bare name instead`);
}
// Examples: valid JSON, and never publish by default.
if (existsSync(join(ROOT, "examples"))) {
  for (const f of walk(join(ROOT, "examples")).filter((p) => p.endsWith(".json"))) {
    let j;
    try { j = JSON.parse(readFileSync(f, "utf8")); } catch (e) { fail(`${relative(ROOT, f)}: not valid JSON (${e.message})`); continue; }
    if (j.action !== "draft") fail(`${relative(ROOT, f)}: action must be "draft", found ${JSON.stringify(j.action)}`);
  }
}

// 6. No real key anywhere.
for (const p of walk(ROOT)) {
  if (p.endsWith(".png")) continue;
  if (/pk_live_[0-9a-zA-Z]{6,}/.test(readFileSync(p, "utf8"))) fail(`${relative(ROOT, p)}: contains what looks like a real API key`);
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("All checks passed.");
