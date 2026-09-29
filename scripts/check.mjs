// Checks the package before a release: `node scripts/check.mjs`.
// Node built-ins only. Exits 1 and lists every problem it finds.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/* The address every agent in this package uses: this endpoint answers 401
   with a WWW-Authenticate pointing at our protected-resource metadata, which
   is how an OAuth client finds the sign-in — see below. */
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

// 1. One MCP file per agent — and since 0.5.0 every one of them signs in.
/* CURSOR AND GROK BUILD SIGN IN TOO (0.5.0, 2026-09-28). They sent a Bearer
   header filled from the API-key environment variable: a credential read from
   the user's environment and sent to a server, which Claude's plugin directory holds for
   review ("Uses a credential from the user's machine", 8 findings) and xAI's
   catalog review treats as exfiltration. Both clients run OAuth themselves
   against a bare URL — Cursor with dynamic registration by default
   (cursor.com/docs/mcp), Grok Build likewise for plugin servers
   (xai-org/grok-build crates/codegen/xai-grok-mcp/src/oauth.rs) — and our
   server already accepts their redirect URIs (lib/oauth/core.ts upstream).
   No ?client=: the admin feed names an OAuth call by the client name the
   client registered itself with, so a tag adds nothing — and the URL has to
   stay exactly the resource the server's metadata describes. */
for (const file of ["mcp.cursor.json", "mcp.grok.json"]) {
  const s = readJson(file)?.mcpServers?.ihateposting;
  if (!s) {
    fail(`${file}: no "ihateposting" server`);
    continue;
  }
  if (s.url !== OAUTH_MCP_URL) fail(`${file}: url is ${JSON.stringify(s.url)}, expected ${OAUTH_MCP_URL}`);
  if (s.type !== "http") fail(`${file}: type is ${JSON.stringify(s.type)}, expected "http"`);
  if (s.headers) fail(`${file}: no headers — this agent signs in with OAuth, and a key header is a credential read from the user's machine`);
}
/* Claude signs in with OAuth, like Gemini CLI below, and never with a key.
   A key needs the plugin's userConfig, and only terminal Claude Code asks for
   that: Cowork does not prompt for it and ignores a server whose option has
   no default, claude.ai chat drops a server whose URL carries one
   (claude.com/docs/plugins/platform-support), and the VS Code extension and
   desktop app could not collect it either (anthropics/claude-code#89749).
   The URL is exactly the one our listing in Claude's connector directory
   publishes, so someone with the connector AND the plugin gets one set of
   tools, not two — which is also why it carries no ?client=. */
const claudeMcp = readJson("mcp.claude.json")?.mcpServers?.ihateposting;
if (!claudeMcp) {
  fail('mcp.claude.json: no "ihateposting" server');
} else {
  if (claudeMcp.url !== OAUTH_MCP_URL) fail(`mcp.claude.json: url is ${JSON.stringify(claudeMcp.url)}, expected ${OAUTH_MCP_URL}`);
  if (claudeMcp.type !== "http") fail(`mcp.claude.json: type is ${JSON.stringify(claudeMcp.type)}, expected "http"`);
  if (claudeMcp.headers) fail("mcp.claude.json: no headers — Claude signs in with OAuth, and a key header needs a userConfig that only terminal Claude Code asks for");
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
if (claude?.userConfig) fail(".claude-plugin/plugin.json: no userConfig — Claude signs in with OAuth, so there is no key for anyone to paste");
if (!/^https:\/\//.test(claude?.privacyPolicyUrl ?? "")) fail(".claude-plugin/plugin.json: privacyPolicyUrl must be an https URL — the directory warns without one");
const cursor = readJson(".cursor-plugin/plugin.json");
if (cursor?.variables) fail(".cursor-plugin/plugin.json: no variables — Cursor signs in with OAuth, so there is no key to configure");
if (cursor?.author && Object.keys(cursor.author).some((x) => !["name", "email"].includes(x))) {
  fail(".cursor-plugin/plugin.json: Cursor's schema allows only name and email in author");
}
/* THE LOGO IS AN SVG (0.5.0). A PNG is a binary the directory's scanner
   cannot read as code, so every reference to it (the README's <img>, a path
   in backticks, this manifest) was held for review. An SVG is a text file —
   which also means it IS read, so it must stay inert: no script, no event
   handler, nothing fetched from elsewhere. url(#…) to its own gradient is fine. */
for (const [file, logo] of [[".cursor-plugin/plugin.json", cursor?.logo], [".grok-plugin/plugin.json", readJson(".grok-plugin/plugin.json")?.logo]]) {
  if (!logo) {
    fail(`${file}: needs a logo`);
    continue;
  }
  if (!logo.endsWith(".svg")) fail(`${file}: logo ${logo} must be the SVG`);
  if (!existsSync(join(ROOT, logo))) fail(`${file}: logo ${logo} does not exist`);
}
for (const logo of new Set([cursor?.logo, readJson(".grok-plugin/plugin.json")?.logo].filter((l) => l && existsSync(join(ROOT, l))))) {
  const svg = readFileSync(join(ROOT, logo), "utf8");
  if (/<script|<foreignObject|<image|\son[a-z]+\s*=|(?:xlink:)?href\s*=|url\((?!#)|@import/i.test(svg)) {
    fail(`${logo}: must be inert — no script, event handler, image, href or external url()`);
  }
}
const grokMarket = readJson(".grok-plugin/marketplace.json");
const gm = grokMarket?.plugins?.find((p) => p.name === "ihateposting");
if (!gm || gm.source?.type !== "local" || gm.source?.path !== "./") {
  fail('.grok-plugin/marketplace.json: needs the ihateposting plugin with source {"type":"local","path":"./"}');
}
if (gm && !gm.domains?.includes("ihateposting.com")) fail(".grok-plugin/marketplace.json: domains must include ihateposting.com");
const market = readJson(".claude-plugin/marketplace.json");
if (market && !market.plugins?.some((p) => p.name === "ihateposting" && p.source === "./")) {
  fail(".claude-plugin/marketplace.json: needs the ihateposting plugin with source ./");
}
/* Gemini CLI was the first agent here to stop taking the API key, because it
   could not send our key variable: its MCP header values are expanded against a SANITIZED environment
   (gemini-cli packages/core/src/tools/mcp-client.ts, createTransportRequestInit),
   and packages/core/src/services/environmentSanitization.ts redacts any
   variable whose NAME matches /KEY/i — which our key variable does. A
   redacted variable expands to "", so the Bearer header went
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
/* QWEN CODE (0.5.3) reads qwen-extension.json before anything else in the
   repository. Without it, Qwen Code fell back to gemini-extension.json and
   copied its server entry as it stood — and Qwen Code takes `url` to mean
   the older SSE transport; only `httpUrl` means Streamable HTTP
   (qwen-code packages/core/src/config/mcp-server-config.ts). `type` is
   reserved there for "sdk". With `httpUrl` set, a 401 from the server marks
   the server as needing sign-in, so no oauth block is needed. */
const qwen = readJson("qwen-extension.json");
if (qwen) {
  if (qwen.name !== "ihateposting") fail("qwen-extension.json: name must be ihateposting");
  const q = qwen.mcpServers?.ihateposting;
  if (!q) {
    fail('qwen-extension.json: no "ihateposting" server');
  } else {
    if (q.httpUrl !== OAUTH_MCP_URL) fail(`qwen-extension.json: httpUrl is ${JSON.stringify(q.httpUrl)}, expected ${OAUTH_MCP_URL}`);
    if (q.url) fail("qwen-extension.json: no url — Qwen Code reads url as SSE, and this server speaks Streamable HTTP");
    if (q.type) fail('qwen-extension.json: no type — Qwen Code reserves it for "sdk"');
    if (q.headers) fail("qwen-extension.json: no headers — Qwen Code signs in with OAuth");
  }
  if (qwen.settings) fail("qwen-extension.json: no settings — signing in with OAuth means there is no key for anyone to paste");
  versions.add(qwen.version);
}
/* KIMI CODE reads .kimi-plugin/plugin.json (or kimi.plugin.json, which would
   win if both existed) — MoonshotAI/kimi-code@2.1.1,
   packages/agent-core-v2/src/app/plugin/manifest.ts:16-17, 38-57. Unlike the
   Claude, Cursor and Grok manifests, its mcpServers must be an inline object:
   a path string is rejected ("mcpServers" must be an object, manifest.ts:334-343).
   A url entry is Streamable HTTP (mcpCore/config-schema.ts:59-66); `transport`
   is spelled out so this check can hold it. With no headers, a 401 from our
   server marks the server as needing sign-in and exposes an authenticate tool
   (mcpCore/connection-manager.ts:485-491; agent/mcp/tools/auth.ts). The
   runtime server name is plugin-ihateposting:ihateposting (plugin/manager.ts:689-691),
   so its tools are mcp__plugin-ihateposting_ihateposting__<tool>
   (mcpCore/tool-naming.ts:6-17) — skillInstructions tells the model so.
   /plugins install <github url> takes the LATEST RELEASE
   (plugin/github-resolver.ts:62-69, 96-125), so this reaches users only
   once a release carries it. */
const kimi = readJson(".kimi-plugin/plugin.json");
if (kimi) {
  if (kimi.name !== "ihateposting") fail(".kimi-plugin/plugin.json: name must be ihateposting");
  if (kimi.skills !== "./skills/") fail('.kimi-plugin/plugin.json: skills must be "./skills/"');
  const k = kimi.mcpServers?.ihateposting;
  if (!k || typeof kimi.mcpServers !== "object") {
    fail('.kimi-plugin/plugin.json: mcpServers must be an inline object with an "ihateposting" server');
  } else {
    if (k.url !== OAUTH_MCP_URL) fail(`.kimi-plugin/plugin.json: url is ${JSON.stringify(k.url)}, expected ${OAUTH_MCP_URL}`);
    if (k.transport !== "http") fail(`.kimi-plugin/plugin.json: transport is ${JSON.stringify(k.transport)}, expected "http" — "sse" is a transport our server does not serve`);
    if (k.headers || k.bearerTokenEnvVar) fail(".kimi-plugin/plugin.json: no headers or bearerTokenEnvVar — Kimi Code signs in with OAuth, and either one turns the sign-in off");
  }
  versions.add(kimi.version);
}
/* THE ONE-CLICK INSTALL LINK, which is a config too — just base64'd inside a
   URL, so nothing above sees it and no human diff reads it.
   It was missed exactly that way on 2026-09-25: every visible JSON block got
   ?client=cursor and the deeplink beside them kept installing an untagged
   server, which would have quietly attributed every Cursor install to nobody.
   Decoding it here means the gate reads what the button actually installs. */
for (const file of walk(ROOT).filter((p) => p.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  for (const [, b64] of text.matchAll(/cursor-deeplink\/mcp\/install\?[^\s)]*?config=([A-Za-z0-9+/=]+)/g)) {
    let cfg;
    try {
      cfg = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    } catch {
      fail(`${relative(ROOT, file)}: a cursor deeplink's config= is not valid base64 JSON`);
      continue;
    }
    if (cfg.url !== OAUTH_MCP_URL) fail(`${relative(ROOT, file)}: cursor deeplink installs url ${JSON.stringify(cfg.url)}, expected ${OAUTH_MCP_URL}`);
    if (cfg.headers) fail(`${relative(ROOT, file)}: cursor deeplink must carry no headers — Cursor signs in with OAuth`);
    if (/pk_live_/.test(b64) || /pk_live_/.test(JSON.stringify(cfg))) fail(`${relative(ROOT, file)}: a cursor deeplink carries a real API key`);
  }
}

if (versions.size !== 1) fail(`manifests disagree on the version: ${[...versions].join(", ")}`);

// 3. No shared file that some directory would install with a raw placeholder.
for (const f of [".mcp.json", "mcp.json", "plugin.json"]) {
  if (existsSync(join(ROOT, f))) fail(`${f} must not exist at the root (see README, "What is in this repository")`);
}

/* Files the directory refuses outright (macOS and Windows litter), and any
   binary — the plugin ships text only, so nothing needs a reviewer's eye. */
for (const p of walk(ROOT)) {
  const rel = relative(ROOT, p).replaceAll("\\", "/");
  if (/(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$|(^|\/)__MACOSX\//i.test(rel)) fail(`${rel}: an operating-system file; delete it`);
  if (/\.(png|jpe?g|gif|webp|ico|pdf|zip|mcpb|dxt)$/i.test(rel)) fail(`${rel}: a binary file — the plugin ships text only`);
}

// 4. The skill.
const SKILL = "skills/ihateposting/SKILL.md";
const raw = readFileSync(join(ROOT, SKILL));
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) fail(`${SKILL}: starts with a UTF-8 BOM, which hides the frontmatter from Gemini CLI`);
const skill = raw.toString("utf8");
if (!/^---\r?\n/.test(skill)) fail(`${SKILL}: --- must be the very first line`);
// Gemini CLI fills ${...} in extension skills from its settings — this exact
// text would put the user's real key into the model's context. Built from
// parts so this file does not itself contain the pattern it hunts for.
const KEY_REF = "$" + "{IHATEPOSTING_API_KEY}";
if (skill.includes(KEY_REF)) fail(`${SKILL}: contains ${KEY_REF}; write the bare name instead`);
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
  // The in-chat upload box (MCP Apps, server 0.7.0). open_upload_widget is the
  // one an agent calls; get_upload_ticket is registered visibility ["app"], so
  // a host hides it from the model entirely and it is deliberately NOT
  // documented in the README as something to call.
  "open_upload_widget", "get_upload_ticket",
];
const NETWORKS = ["Bluesky", "X", "LinkedIn", "Facebook", "Threads", "Mastodon", "Telegram", "Discord", "Tumblr", "Slack", "Instagram", "Pinterest", "TikTok", "YouTube"];
const readme = existsSync(join(ROOT, "README.md")) ? readFileSync(join(ROOT, "README.md"), "utf8") : "";
for (const t of TOOLS) if (!readme.includes(`\`${t}\``)) fail(`README.md: does not list the \`${t}\` tool`);
// get_upload_ticket is app-only, so a model sees one tool fewer than TOOLS.
const MODEL_TOOLS = TOOLS.length - 1;
for (const m of readme.matchAll(/\b(\d+) tools\b/g)) {
  if (Number(m[1]) !== MODEL_TOOLS) fail(`README.md: says "${m[0]}", but a model sees ${MODEL_TOOLS}`);
}
for (const n of NETWORKS) if (!new RegExp(`\\b${n}\\b`).test(readme)) fail(`README.md: does not mention ${n}`);
// A backticked tool-shaped name in the skill must be a real tool.
const toolShaped = /`((?:get|list|create|update|delete|retry|reschedule|upload|validate|publish|schedule|cancel|unschedule|remove|send)_[a-z_]+|whoami)`/g;
for (const f of walk(join(ROOT, "skills")).filter((p) => p.endsWith(".md"))) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(toolShaped)) if (!TOOLS.includes(m[1])) fail(`${relative(ROOT, f)}: names \`${m[1]}\`, which is not an iHatePosting tool`);
  // Same leak as SKILL.md: Gemini CLI fills \${...} in every skill file it loads.
  if (text.includes(KEY_REF)) fail(`${relative(ROOT, f)}: contains ${KEY_REF}; write the bare name instead`);
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
  if (/pk_live_[0-9a-zA-Z]{6,}/.test(readFileSync(p, "utf8"))) fail(`${relative(ROOT, p)}: contains what looks like a real API key`);
}

// 7. The ClawHub copy (clawhub/ihateposting): the same references as the
// plugin's skill, and none of the plugin-only fields. OpenClaw and Hermes
// Agent take the skill from ClawHub, where every skill is published under
// MIT-0 (ClawHub docs/skill-format.md, "License"), so the copy carries no
// licence line; and they add the server by hand, so it carries no Claude
// Code tool list. ClawHub's scanner and Hermes Agent's install guard read
// the same files, so the rules for the plugin's skill apply to it too.
const CH = "clawhub/ihateposting";
if (existsSync(join(ROOT, CH))) {
  const chSkill = readFileSync(join(ROOT, CH, "SKILL.md"), "utf8");
  const chFm = chSkill.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  if (!/^name:\s*ihateposting\s*$/m.test(chFm)) fail(`${CH}/SKILL.md: name must be ihateposting`);
  if (/^(license|allowed-tools):/m.test(chFm)) fail(`${CH}/SKILL.md: no license (ClawHub applies MIT-0) and no allowed-tools (Claude Code names)`);
  for (const f of walk(join(ROOT, CH)).filter((p) => p.endsWith(".md"))) {
    const t = readFileSync(f, "utf8");
    if (t.includes("$")) fail(`${relative(ROOT, f)}: contains a dollar sign`);
    if (/\bpass/i.test(t)) fail(`${relative(ROOT, f)}: contains "pass"`);
    if (t.includes(KEY_REF)) fail(`${relative(ROOT, f)}: contains ${KEY_REF}`);
    for (const m of t.matchAll(toolShaped)) if (!TOOLS.includes(m[1])) fail(`${relative(ROOT, f)}: names \`${m[1]}\`, which is not an iHatePosting tool`);
  }
  const a = readFileSync(join(ROOT, "skills/ihateposting/references/platform-options.md"));
  const b = readFileSync(join(ROOT, CH, "references/platform-options.md"));
  if (!a.equals(b)) fail(`${CH}/references/platform-options.md: differs from the plugin's copy`);
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("All checks passed.");
