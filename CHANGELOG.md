# Changelog

## 0.3.3

- The Cursor **one-click install link** now installs the tagged URL too. 0.3.2
  updated every visible JSON block and missed this one, because its config is
  base64 inside a `cursor://` URL — invisible to a reader and to the release
  gate. Anyone who used the button instead of copying the block was still
  installing an untagged server.
- `scripts/check.mjs` now decodes those deeplinks and checks what the button
  actually installs, so the two can never drift apart again. It also asserts
  each config declares the RIGHT client id rather than merely having one — a
  file copy-pasted from another client is the failure that matters.
- This is the fix for 0.3.2 landing with a red CI check: the gate hardcoded the
  untagged URL and exact-matched it, so the release that added the tag failed
  its own test.

## 0.3.2

- The three key-based configs now say which tool they are, as `?client=` on
  the server URL: `claude-code`, `cursor` and `grok`. An API key identifies a
  person and never an app, so until now every connector arrived anonymously
  and iHatePosting's own admin could only show the key's prefix — Claude Code,
  Cursor and a hand-written script were indistinguishable. The id is a public
  name, not a credential; nothing is granted on the strength of it, and an
  unrecognised value is simply ignored.
- `gemini-extension.json` is deliberately unchanged. It signs in over
  `/mcp/oauth`, so it is already named by its own registration and has nothing
  to declare.

## 0.3.1

- The skill no longer tells a Gemini CLI user to fetch an API key. Gemini CLI
  discovers `skills/` at the extension root on its own — the official example
  declares nothing but a name and a version — so SKILL.md reaches the model
  there, and since 0.3.0 removed the key it was giving instructions that
  cannot be followed: `gemini extensions config ihateposting` now configures
  nothing, because there is no setting left to configure.
- "Check the key first" is now "Check the sign-in first", and it sends a
  Gemini CLI user to `/mcp auth ihateposting` instead. It also says outright
  never to ask that user for a key: there is nowhere to put one, and a key in
  a header would be blanked before it left the machine.
- `compatibility` now says an account is what is required, and that most
  agents send a key while Gemini CLI signs in.

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
