# Changelog

## 0.3.0

- Gemini CLI now signs in with OAuth instead of taking an API key, and the
  extension points at `https://ihateposting.com/mcp/oauth`. The key never
  worked there: Gemini CLI expands `${...}` in MCP headers against a
  sanitized environment and blanks any variable whose NAME matches
  `/KEY/i`, `/TOKEN/i`, `/SECRET/i` or `/AUTH/i`, so
  `Authorization: Bearer ${IHATEPOSTING_API_KEY}` was sent as a bare
  `Bearer ` and every call returned 401. Nothing in Google's documentation
  says this, and their own worked example hardcodes the token.
  (gemini-cli `packages/core/src/tools/mcp-client.ts` →
  `createTransportRequestInit`, and
  `packages/core/src/services/environmentSanitization.ts`.)
- `oauth.enabled` is set explicitly, because Gemini CLI only starts the
  sign-in by itself when it is true — "Only trigger automatic OAuth if
  explicitly enabled in config". Without it a user gets a 401 and is left to
  run `/mcp auth ihateposting` by hand.
- Nothing changed on the server: the sign-in uses the OAuth 2.1 endpoints
  iHatePosting already publishes, which Gemini CLI finds through the same
  RFC 9728 metadata Claude uses.
- `scripts/check.mjs` now asserts the Gemini extension has no headers and no
  settings, and that `oauth.enabled` is true, so the redaction trap cannot
  come back unnoticed.
- The other three agents are unchanged and still send the API key.

## 0.2.0

- README now starts with what an agent can do, then lists the 15 tools, the
  14 networks, media, analytics, other ways to connect, the REST API,
  webhooks, limits and troubleshooting. Install steps for each agent are in
  collapsible sections.
- New `docs/platforms.md`: what each network accepts and its main options.
- New `docs/api.md`: the REST API, uploads and webhooks.
- New `skills/ihateposting/references/platform-options.md`: the option keys
  per network, which the skill reads when a post needs them.
- New `examples/`: draft-only `create_post` payloads and example prompts.
- The skill covers more: rescheduling a draft makes it publish, a
  multi-network post splits when `update_post` schedules it, TikTok privacy
  and inbox drafts, held sends, and the rate limit of each tool.
- Manifest keywords list all 14 networks.
- `scripts/check.mjs` also checks that the README names every tool and
  network, that the skill names only real tools, and that every example is a
  draft. `.github/workflows/check.yml` runs it on every push and pull request.

## 0.1.0

- First release: the plugin for Claude Code, Cursor, Gemini CLI and Grok
  Build, the hosted MCP server connection and the `ihateposting` skill.
