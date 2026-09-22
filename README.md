# iHatePosting for AI agents

Let your AI agent draft, check, schedule and publish posts to 14 social
networks — Bluesky, X, LinkedIn, Facebook, Instagram, Threads, Pinterest,
TikTok, YouTube, Mastodon, Telegram, Discord, Tumblr and Slack — through the
accounts you have connected at [ihateposting.com](https://ihateposting.com).

This repository is one package for four agents: **Claude Code**, **Cursor**,
**Gemini CLI** and **Grok Build**. Each gets the hosted iHatePosting MCP server
and a skill that teaches the agent how to post safely.

**Nothing goes out unless you say so.** A new post is saved as a draft unless
you ask for it to be published now or at a set time. Tools that publish,
change or delete are marked as such, so agents that honour those markings ask
you before running them. Deleting a post in iHatePosting never removes one
that is already live on a network.

## First, get an API key

Sign in at [ihateposting.com](https://ihateposting.com), open **Settings →
Developers** and create a key. It starts with `pk_live_` and is shown in full
only once, so copy it then. There is one key per account: making a new one
switches the old one off everywhere it is used.

## Claude Code

Inside **terminal** Claude Code:

```
/plugin marketplace add iHatePostingOrg/agent-skill
/plugin install ihateposting@ihateposting
```

The install asks for your API key and stores it as a secret. Three things to
know:

- **Install from terminal Claude Code.** `claude plugin install` from a plain
  shell does not ask for the key; add `--config api_key=<your key>` there, and
  note that this leaves the key in your shell history. The VS Code extension
  and the desktop app currently cannot collect the key at all
  ([anthropics/claude-code#89749](https://github.com/anthropics/claude-code/issues/89749)),
  and without it the server does not start.
- **Already added iHatePosting by hand?** Run `claude mcp remove ihateposting`
  first. Claude Code matches plugin servers by address, so an existing manual
  entry for the same URL wins and the plugin's copy is skipped.
- **Changing the key:** `/plugin configure ihateposting@ihateposting`.

## Cursor

Once the plugin is listed in the Cursor Marketplace, install it and set
`IHATEPOSTING_API_KEY` under **Plugins → Configure**. On a Cursor team, check
whether that value is stored per person before an admin sets it: an
iHatePosting key acts as one person's account, so a shared value would make
everyone post as that person.

To add the server by hand instead, put this in `~/.cursor/mcp.json`, set
`IHATEPOSTING_API_KEY` in your environment and restart Cursor:

```json
{
  "mcpServers": {
    "ihateposting": {
      "type": "http",
      "url": "https://ihateposting.com/mcp",
      "headers": { "Authorization": "Bearer ${env:IHATEPOSTING_API_KEY}" }
    }
  }
}
```

The same configuration as a one-click link (it holds the `${env:…}` reference,
never a key):

```
cursor://anysphere.cursor-deeplink/mcp/install?name=ihateposting&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vaWhhdGVwb3N0aW5nLmNvbS9tY3AiLCJoZWFkZXJzIjp7IkF1dGhvcml6YXRpb24iOiJCZWFyZXIgJHtlbnY6SUhBVEVQT1NUSU5HX0FQSV9LRVl9In19
```

## Gemini CLI

```bash
gemini extensions install https://github.com/iHatePostingOrg/agent-skill
```

Gemini CLI asks for your API key during the install and keeps it in your
system keychain. Change it later with `gemini extensions config ihateposting`.
The extension uses `url` with `type: "http"`, the form Gemini CLI 0.21 and
later reads as Streamable HTTP.

## Grok Build

Grok Build cannot ask for a secret, so the key comes from your environment.
Set it in the shell that starts `grok`, then install:

```bash
export IHATEPOSTING_API_KEY=pk_live_...
grok plugin install iHatePostingOrg/agent-skill --trust
```

A plugin's MCP server stays off until the plugin is trusted, which is what
`--trust` does.

## Other agents

ChatGPT, Claude on the web and desktop, VS Code with GitHub Copilot, Codex,
Windsurf, Zed, Cline, OpenClaw and more connect to the same server without
this package. The setup for each is at
[ihateposting.com/guides/post-to-social-media-from-an-ai-agent](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent).

OpenClaw's documentation says it reads a package with a `.cursor-plugin/`
folder as a Cursor bundle, so installing this repository there is not
expected to add the MCP server. Use OpenClaw's own MCP setup from the guide
instead.

## Network endpoints and credentials

- It calls exactly one endpoint: `https://ihateposting.com/mcp`, MCP over
  Streamable HTTP.
- It needs one credential: an iHatePosting API key, sent as
  `Authorization: Bearer <key>`. Claude Code and Gemini CLI store it as a
  secret; Cursor keeps it as a plugin setting; Grok Build reads it from the
  `IHATEPOSTING_API_KEY` environment variable.
- There are no hooks and no install scripts, and nothing runs on your machine.

## What is in this repository

| Path | For |
|------|-----|
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `mcp.claude.json` | Claude Code |
| `.cursor-plugin/plugin.json`, `mcp.cursor.json`, `assets/logo.png` | Cursor |
| `gemini-extension.json` | Gemini CLI |
| `.grok-plugin/plugin.json`, `mcp.grok.json` | Grok Build |
| `skills/ihateposting/SKILL.md` | All four |

Each agent has its own MCP file because each fills in the key differently:
Claude Code from the plugin's settings (`${user_config.api_key}`), and the
others from `IHATEPOSTING_API_KEY`. There is deliberately no `.mcp.json` at the
root — directories that read one would install a server with an unfilled
placeholder in place of a key.

`node scripts/check.mjs` checks the files before a release.

## License

MIT — see [LICENSE](LICENSE).
