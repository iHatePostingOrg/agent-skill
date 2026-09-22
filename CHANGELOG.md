# Changelog

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
