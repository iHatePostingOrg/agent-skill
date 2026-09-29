![iHatePosting logo](assets/logo.svg)

# iHatePosting for AI agents

Let Claude, Claude Code, Cursor, Gemini CLI, Grok Build, Kimi Code or Qwen
Code draft, check, schedule and publish posts on 14 social networks, using the
accounts you have connected at [ihateposting.com](https://ihateposting.com). This
package gives each agent the hosted iHatePosting MCP server (16 tools) and a
skill that teaches it to post safely. Every agent here signs in with your
iHatePosting account; none of them needs an API key.

Set-up pages for every agent:
[Claude](https://ihateposting.com/ai-agents/claude) ·
[Claude Code](https://ihateposting.com/ai-agents/claude-code) ·
[Claude Cowork](https://ihateposting.com/ai-agents/claude-cowork) ·
[ChatGPT](https://ihateposting.com/ai-agents/chatgpt) ·
[Codex](https://ihateposting.com/ai-agents/codex) ·
[Cursor](https://ihateposting.com/ai-agents/cursor) ·
[Gemini CLI](https://ihateposting.com/ai-agents/gemini-cli) ·
[Grok Build](https://ihateposting.com/ai-agents/grok-build) ·
[VS Code and GitHub Copilot](https://ihateposting.com/ai-agents/vs-code) ·
[OpenClaw](https://ihateposting.com/ai-agents/openclaw) ·
[Hermes Agent](https://ihateposting.com/ai-agents/hermes-agent) ·
[DeepSeek Harness](https://ihateposting.com/ai-agents/deepseek-harness) ·
[Perplexity Computer](https://ihateposting.com/ai-agents/perplexity-computer) ·
[Muse](https://ihateposting.com/ai-agents/muse) ·
[NanoClaw](https://ihateposting.com/ai-agents/nanoclaw) ·
[Paperclip](https://ihateposting.com/ai-agents/paperclip) ·
[Antigravity CLI](https://ihateposting.com/ai-agents/antigravity-cli) ·
[Amp](https://ihateposting.com/ai-agents/amp) ·
[Cline](https://ihateposting.com/ai-agents/cline) ·
[Kilo Code](https://ihateposting.com/ai-agents/kilo-code) ·
[Zed](https://ihateposting.com/ai-agents/zed) ·
[Warp](https://ihateposting.com/ai-agents/warp) ·
[Devin Desktop](https://ihateposting.com/ai-agents/devin-desktop) ·
[OpenHands CLI](https://ihateposting.com/ai-agents/openhands-cli) ·
[Freebuff CLI](https://ihateposting.com/ai-agents/freebuff-cli) ·
[omp](https://ihateposting.com/ai-agents/omp) ·
[all of them](https://ihateposting.com/ai-agents)

Some of those pages add the server by hand, with an API key; for Claude,
Claude Code, Cursor, Gemini CLI, Grok Build, Kimi Code and Qwen Code, the
plugin in this repository signs in instead ([Install](#install)).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm: ihateposting-mcp](https://img.shields.io/npm/v/ihateposting-mcp?label=ihateposting-mcp)](https://www.npmjs.com/package/ihateposting-mcp)
[![npm: ihateposting](https://img.shields.io/npm/v/ihateposting?label=ihateposting)](https://www.npmjs.com/package/ihateposting)
<!-- ?variant=verified is deliberate, not an oversight. The default badge
     renders the numeric grade, which is currently "C · Limited view" (74/100)
     — and M8ven's own listing explains why: "New projects cap at C until
     adoption is earned", on a repo that is days old with no stars yet, plus
     "static analysis for JavaScript is partially covered". That number
     measures this repository's age and adoption, not the server's quality, so
     showing it would tell a reader something the assessment did not actually
     say. The verified variant claims only what was genuinely established —
     Verified Publisher, connected through their GitHub App, re-checked on
     every push. Swap the variant out once the grade reflects the code. -->
[![M8ven: continuously verified](https://m8ven.ai/badge/mcp/ihatepostingorg-agent-skill-1f032g?variant=verified)](https://m8ven.ai/mcp/ihatepostingorg-agent-skill-1f032g)

**Nothing goes out unless you say so.** A new post is saved as a draft unless
you ask for it to be published now or at a set time.

## What your agent can do

- **Draft, schedule or publish** one post to several networks at once, either
  to every account you have on a network or to one account you pick. A time
  such as "9:00 AM" is read in the timezone set in your iHatePosting
  settings (Settings → Scheduling), not your computer's.
- **Check a post before it exists.** `validate_post` runs the checks the
  publisher runs just before it posts, and creates nothing. It also tells you
  when a network has no connected account, or one that needs reconnecting.
- **Learn each network's rules**: character limit, media rules and the
  options a network requires, such as a Pinterest board.
- **Write per network**: different text for one network, and that network's
  own settings. That covers threads on X, Bluesky, Threads and Mastodon, a
  first comment on Instagram, LinkedIn and Threads, Instagram Reels, Stories
  and carousels, Facebook Reels and Stories, TikTok photo posts and privacy,
  and a YouTube video's title, privacy and playlist.
- **Attach media**: upload an image or a short video with alt text, or reuse
  anything already in your media library.
- **Manage what is already there**: see what happened on each network, rewrite
  a draft, scheduled or failed post, move it to another time, resend only what
  failed, or delete it.
- **Report results**: per-channel numbers, follower counts, posting times and
  top posts, from 7 days back to everything recorded.

Every plan includes the API key that the MCP server, the REST API and the CLI
use. Webhooks come with every plan too.

## Tools

The hosted server offers these 16 tools, plus one the upload box uses by
itself. The last column is what a tool does to your posts and accounts.

| Tool | What it does | Effect |
|------|--------------|--------|
| `whoami` | Names the iHatePosting login this connection acts for (email and account name), whether it signed in or uses a key; not a social handle | Reads |
| `list_accounts` | Lists connected social accounts with platform, handle, status and id | Reads |
| `get_platform_rules` | Each network's character limit, media rules, video formats and length, and required options | Reads |
| `validate_post` | Checks a post against every network you name, without creating anything | Reads |
| `create_post` | Creates a post: a draft by default, or `now` or `schedule` when asked | Creates; publishes with `now` or `schedule` |
| `list_posts` | Posts with each network's status and live URL — filter by `status` and a `from`/`to` scheduled-date range, page with `cursor`, and read `total` for the real count | Reads |
| `get_post` | One post in full: text, per-network copy and options, media, and each send's result or error | Reads |
| `update_post` | Replaces a draft, scheduled or failed post with what you send | Changes; publishes with `now` or `schedule` |
| `reschedule_post` | Moves a draft or scheduled post to a new date and time | Publishes at the new time, including a draft |
| `retry_post` | Sends again only what failed, on one network or all of them | Publishes |
| `delete_post` | Removes iHatePosting's record of a post; a published post needs `force` | Deletes; never unpublishes |
| `list_media` | Your media library, newest first, with the ids posts attach | Reads |
| `upload_media` | Adds an image or video to the library and returns its id — from a `url` (preferred; up to 100 MB, images up to 25 MB) or as `base64` (up to 8 MB) | Creates a library file |
| `open_upload_widget` | Shows a file picker in the conversation so the person can upload from their own device | Creates a library file |
| `get_upload_ticket` | Internal — the upload box calls this itself for a one-time upload credential. Registered `visibility: ["app"]`, so a host hides it from the model and it is not a tool an agent calls | Issues a short-lived credential |
| `list_pinterest_boards` | The Pinterest boards you can pin to, with the board id a pin needs | Reads |
| `get_analytics` | How posts performed, per connected channel, over a range you choose | Reads |

## Networks

All 14 networks work through the same tools. Name one in `platforms`
(`bluesky`, `x`, `linkedin`, `facebook`, `threads`, `mastodon`, `telegram`,
`discord`, `tumblr`, `slack`, `instagram`, `pinterest`, `tiktok`, `youtube`),
or pass an account id from `list_accounts`.

| Network | Text limit | Media | You must set | Also supports |
|---------|-----------:|-------|--------------|---------------|
| Bluesky | 300 | Up to 4 images; video | | Multi-post threads, alt text |
| X | 280, weighted (a link counts 23) | Up to 4 images; video | | Multi-post threads, reply settings |
| LinkedIn | 3,000 | Up to 20 images; video | | Company Pages and personal profiles, first comment |
| Facebook | 63,000 | Up to 10 images; video | | Pages, Reels, Stories |
| Instagram | 2,200 | Required: up to 10 images or videos | | Reels, Stories, carousels, first comment, collaborators, tagged accounts |
| Threads | 500 | Up to 20 images or videos | | Multi-post threads, carousels, first comment |
| Pinterest | 800 | Required: an image or a video | A board | Pin title and destination link |
| TikTok | 2,200 | Required: a video, or photos (up to 20 per post here) | | Privacy, send to your TikTok inbox, AI-generated label, comment, duet and stitch settings |
| YouTube | 5,000 (description) | Required: one video | A title, and made for kids yes or no | Privacy, playlist, tags, category, custom thumbnail |
| Mastodon | 500 | Up to 4 images; video | | Multi-post threads, visibility, alt text |
| Telegram | 4,096 (1,024 as a caption under media) | Up to 10 images; video | | |
| Discord | 2,000 | Up to 10 images; video | | |
| Tumblr | 4,096 | Up to 20 images per post; video | | Title, tags |
| Slack | 3,000 | Up to 5 images; video | | |

If you leave them out, `create_post` fills a YouTube title and a Pinterest
pin title from the first line of your text, a Pinterest link from the first
URL in it, and YouTube and Tumblr tags from its hashtags. `validate_post` does
not fill them in, so it reports a missing YouTube title as a problem.

What each network accepts, with its main options, is in
[docs/platforms.md](docs/platforms.md). The option keys a post is likely to
need, with their values and defaults, are in the reference the skill loads
when it needs it
([skills/ihateposting/references/platform-options.md](skills/ihateposting/references/platform-options.md)).
A post can attach at most 20 media items, whatever a network allows.

## Example prompts

- "What is scheduled to go out this week, and did anything fail?"
- "Draft this announcement for LinkedIn, Bluesky and X. Give X a shorter
  version, and check all three before you save."
- "Turn these notes into a thread for X and Threads and save it as a draft."
- "Upload this photo with alt text and draft an Instagram post with it. Put
  the hashtags in the first comment."
- "Which of my Pinterest boards suits this recipe? Draft a pin to it."
- "Why did yesterday's LinkedIn post fail?"
- "How did my posts do over the last 30 days, and which network did well?"

[examples/](examples/) has ready-made `create_post` payloads for threads,
Reels, carousels, YouTube, Pinterest, TikTok and more. Every one is a draft.

## Install

Every agent below signs you in to your iHatePosting account in the browser.
None of them needs an API key.

| Agent | How it installs | How it connects |
|-------|-----------------|-----------------|
| Claude (claude.ai, desktop app, Cowork) | **Customize → Plugins** on a paid Claude plan, adding this repository as a marketplace | You sign in in the browser |
| Claude Code | `/plugin install` from this repository's marketplace | You sign in in the browser |
| Cursor | Cursor Marketplace once listed, a local copy, or `~/.cursor/mcp.json` | You sign in in the browser |
| Gemini CLI | `gemini extensions install` | You sign in in the browser |
| Grok Build | `grok plugin install ... --trust` | You sign in in the browser |
| Kimi Code | `/plugins install` inside Kimi Code | You sign in in the browser |
| Qwen Code | `qwen extensions install` | You sign in in the browser |
| Any agent that reads skills | `npx skills add` (the skill only) | Connect the server as that agent's page says |
| ChatGPT and others | Their own MCP settings | See the [setup guide](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent) |

<details>
<summary><strong>Claude (claude.ai, the desktop app, Cowork)</strong></summary>

In **Customize → Plugins**, choose **Add → Add marketplace**, enter
`https://github.com/iHatePostingOrg/agent-skill` and install **iHatePosting**.
Then open the plugin's **Connectors** tab and connect iHatePosting: you sign
in to your iHatePosting account and press **Allow**. There is no key to paste.

Already added the iHatePosting connector from Claude's directory? The plugin
uses the same address, so you get one set of tools, not two.

Plugins need a paid Claude plan (Pro, Max, Team or Enterprise). On the Free
plan, add iHatePosting from Claude's connector directory instead: it signs in
the same way and gives the same tools, without this plugin's skill.

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```
/plugin marketplace add iHatePostingOrg/agent-skill
/plugin install ihateposting@ihateposting
```

Then run `/mcp`, pick the iHatePosting server and choose **Authenticate**. A
browser window opens: sign in to your iHatePosting account and press
**Allow**. There is no key to paste.

- **Already added iHatePosting by hand?** Remove that entry with
  `claude mcp remove ihateposting`, or every tool shows up twice.
- **Coming from 0.3.x?** Earlier versions asked for an API key. After the
  update, authenticate once from `/mcp` as above; the plugin no longer sends
  the key.

</details>

<details>
<summary><strong>Cursor</strong></summary>

Once the plugin is listed in the Cursor Marketplace, open **Customize** in
Cursor's sidebar, find **iHatePosting** and choose **Install**, for one
project or for all of them. Cursor signs you in to your iHatePosting account
in the browser; press **Allow**. Each person on a Cursor team signs in as
themselves, so nobody posts from someone else's account. On a Cursor
Enterprise plan with an MCP allowlist, allow `https://ihateposting.com/mcp/oauth`.

Before the listing, install a local copy. Clone or copy this repository into
`~/.cursor/plugins/local/ihateposting` (on Windows,
`%USERPROFILE%\.cursor\plugins\local\ihateposting`). Cursor skips a symlink
there that points to a folder somewhere else, so copy the files. Then restart
Cursor or run **Developer: Reload Window**, and check under **Customize**
that the iHatePosting skill and MCP server are listed. On Teams and
Enterprise plans, an admin controls this with **Allow Local Plugin
Imports**, which is off by default on Enterprise. Once you install the
Marketplace version, it is used instead of the local copy.

If you already added the server by hand in `~/.cursor/mcp.json`, remove that
entry when you install the plugin, so there is one iHatePosting server.

To add only the server by hand, put this in `~/.cursor/mcp.json` and restart
Cursor:

```json
{
  "mcpServers": {
    "ihateposting": {
      "type": "http",
      "url": "https://ihateposting.com/mcp/oauth"
    }
  }
}
```

Then open **Customize**, then **MCPs**, turn iHatePosting on and press
**Connect** to sign in.

The same configuration as a one-click link:

```
cursor://anysphere.cursor-deeplink/mcp/install?name=ihateposting&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vaWhhdGVwb3N0aW5nLmNvbS9tY3Avb2F1dGgifQ==
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

```bash
gemini extensions install https://github.com/iHatePostingOrg/agent-skill
```

No API key. The next time you start Gemini CLI, it connects to the server
and opens your browser: sign in to iHatePosting and press **Allow**. It keeps
the token in `~/.gemini/mcp-oauth-tokens.json` and refreshes it as needed.
Sign in again later with `/mcp auth ihateposting`.

Gemini CLI could not have taken our key from a header anyway: it expands
`${...}` in MCP headers against a sanitized environment and blanks any
variable whose name contains KEY, TOKEN, SECRET or AUTH, so a header built
from our key variable would leave empty and every call would fail, with
nothing in Google's docs to warn you. Signing in avoids the problem rather
than working around it.

The extension uses `url` with `type: "http"`, the form Gemini CLI 0.21 and
later reads as Streamable HTTP.

</details>

<details>
<summary><strong>Grok Build</strong></summary>

```bash
grok plugin install iHatePostingOrg/agent-skill --trust
```

A plugin's MCP server stays off until the plugin is trusted, which is what
`--trust` does. Then start `grok`, open `/mcps`, select ihateposting and
press `i`: Grok Build opens your browser, you sign in to your iHatePosting
account and press **Allow**. The tools appear once you have signed in. To
sign in again later, do the same.

</details>

<details>
<summary><strong>Kimi Code</strong></summary>

Inside Kimi Code:

```
/plugins install https://github.com/iHatePostingOrg/agent-skill
```

Kimi Code installs this repository's latest release and reads its
`.kimi-plugin/plugin.json`, which adds the server and the skill. When the
server first says it needs a sign-in, Kimi Code offers an `authenticate`
step: approve it, and your browser opens; sign in to iHatePosting and press
**Allow**. You can also run `/mcp` to see the server's name and then
`/mcp-config login` with that name. There is no key to paste. Kimi Code keeps
the token under `~/.kimi-code/credentials/mcp/`.

Kimi Code's manifest names the server inline rather than in a separate file,
with `transport` set to `http` (Streamable HTTP). This was read from Kimi
Code's source (release 2.1.1); it has not yet been run in Kimi Code itself.

</details>

<details>
<summary><strong>Qwen Code</strong></summary>

```bash
qwen extensions install iHatePostingOrg/agent-skill:ihateposting
```

Then open `/mcp` in Qwen Code, select iHatePosting and choose
**Authenticate**. A browser window opens: sign in to your iHatePosting account
and press **Allow**. There is no key to paste. Qwen Code keeps the token in
`~/.qwen/mcp-oauth-tokens.json` and refreshes it as needed; to sign in again
later, choose **Re-authenticate** in the same place.

The `:ihateposting` at the end names the plugin, so Qwen Code does not ask
which one to install. It reads this repository's own `qwen-extension.json`,
which adds the server and the skill. That file sets `httpUrl` rather than
`url`, because Qwen Code reads a bare `url` as the older SSE transport, which
this server does not speak.

</details>

<details>
<summary><strong>Other agents</strong></summary>

ChatGPT, VS Code with GitHub Copilot, Codex, OpenClaw, Hermes Agent,
DeepSeek Harness, Perplexity Computer, Zed, Cline and more connect to the same
server without this package. Each has a set-up page (the list at the top of
this README), and the
[setup guide](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent)
covers them all.

OpenClaw's documentation says it reads a package with a `.cursor-plugin/`
folder as a Cursor bundle, so installing this repository there is not
expected to add the MCP server. Use OpenClaw's own MCP setup from its page
instead.

</details>

<details>
<summary><strong>Any agent that reads skills</strong></summary>

The skill is listed on [skills.sh](https://www.skills.sh/ihatepostingorg/agent-skill/ihateposting),
so an agent that reads skills can take it from there:

```bash
npx skills add https://github.com/ihatepostingorg/agent-skill --skill ihateposting
```

That copies the skill only. It does not connect the iHatePosting server:
connect that as your agent's set-up page describes. The skill works through
the server's tools; the `ihateposting` command line
([below](#other-ways-to-connect)) is a separate tool with its own
instructions (`ihateposting skill --print`).

</details>

## Get an API key

None of the agents above needs one. A key is for the `ihateposting` command
line, the local npm server, the REST API, and agents that cannot sign in.

Sign in at [ihateposting.com](https://ihateposting.com), open **Settings →
Developers** and create a key. It starts with `pk_live_`, and you can show it
again later from the same page (a key made before keys could be shown again,
in late September 2026, cannot be; the page says so, and regenerating gives
you one that can). There is one key per account:
regenerating switches the old one off everywhere it is used. The key can post
on your behalf, so keep it out of chats, screenshots and shared files.

## Safety

- **Drafts by default.** `create_post` saves a draft unless it is given
  `action: "now"` (publish at once) or `action: "schedule"` (publish at a set
  time). The CLI also saves a draft unless told otherwise. The REST API has no
  default at all: a request without `action` is refused.
- **Broken posts are refused before they are saved.** A post that is meant to
  go out is checked against every network it targets when it is created or
  updated, and refused with the network's reason if any of them would reject
  it. Drafts skip this check, so an unfinished post can be saved. The
  publisher checks each send again just before posting and skips one that
  fails.
- **Rescheduling a draft publishes it.** `reschedule_post` turns a draft into
  a scheduled post, and the create-time check does not run on that path. Call
  `validate_post` first.
- **A scheduled post cannot go back to being a draft.** `update_post` refuses
  that. Delete the post and create it again as a draft.
- **Scheduling a multi-network post splits it.** When `create_post` or
  `update_post` schedules or publishes a post for more than one account, it
  becomes one post per account, sharing a group id; `create_post`'s answer
  lists each one. A draft stays one post. After the split, `reschedule_post`
  and `delete_post` act on one of them at a time, and `update_post` can change
  one's text, options and media as long as you send that post's own
  `accountIds` — adding or swapping an account is refused.
- **Deleting never unpublishes.** `delete_post` removes iHatePosting's record
  only. A published post is refused unless `force` is set, and it stays live on
  the network. A post that is publishing right now cannot be deleted.
- **Retry only resends what failed.** A send that published is left alone.
  A network can report a failure for a post that went live anyway, so check
  the network before retrying.
- **Approval prompts depend on the agent.** In Claude Code the skill
  pre-approves only the tools that read, so anything that creates, changes,
  publishes or deletes asks first unless your own permission settings allow
  it. Cursor, Gemini CLI, Grok Build, Kimi Code and Qwen Code apply their own
  approval settings.
- **Social accounts are connected at ihateposting.com, never through an
  agent.** Each network's own sign-in page handles the password, and posts go
  out through each network's official API, the same way the iHatePosting app
  sends them. An agent never sees a social login.

## Media

- `upload_media` takes either a `url` we fetch ourselves — preferred, and the
  only route that works for a video of any real size (up to 100 MB; images up
  to 25 MB) — or the file as
  `base64`, with an optional alt text, and returns a library id to put in
  `mediaIds`. base64 through a conversation is capped at 8 MB and is the bytes
  the model itself typed, so it truncates: never use it for a file that only
  exists as a chat attachment. `open_upload_widget` covers that case by
  showing a file picker in the conversation, and the `ihateposting upload
  <path>` CLI command covers it for an agent with a shell. Images can be JPEG,
  PNG, WebP or GIF; videos can be MP4, MOV or WebM.
- `list_media` returns ids, sizes and dimensions of what is already uploaded,
  never a download link. (The REST `GET /api/v1/media` does include one.)
- A post takes up to 20 media ids, attached in the order you give them.
- Larger files: upload them at ihateposting.com and find them with
  `list_media`, or use the REST upload routes, which take images up to 25 MB
  and videos up to 512 MB in one upload, or up to 2,000 MB in parts. See
  [docs/api.md](docs/api.md).
- Your library has a storage quota: 500 MB on the 90-day free trial. The paid
  plans, once they go on sale, have 5 GB (Creator), 25 GB (Growth) and 100 GB
  (Pro).
- Alt text is published on Bluesky, Instagram, Threads, Mastodon, Pinterest,
  Tumblr and Slack. LinkedIn uses it as a video's title.
- A custom video cover is an image from your library, set with `coverAssetId`
  in that network's options. YouTube, Instagram, Facebook, LinkedIn,
  Pinterest, Telegram, Mastodon and Tumblr use it. TikTok does not take an
  uploaded cover.
- TikTok photo posts take JPEG or WebP, not PNG.

## Analytics

`get_analytics` takes a range of `7d`, `15d`, `30d` (the default), `90d`,
`12m` or `all`. For each connected channel it returns that network's own
metrics, follower numbers, views, engagements and engagement rate, posting
times by weekday and time of day, a daily trend, and the top five posts.
Analytics is the same on every plan, including long ranges. Over the REST API,
`GET /api/v1/analytics?range=30d&format=xlsx` returns a spreadsheet of the
posts you published through iHatePosting in that range.

Per-post numbers come from Bluesky, Facebook, Instagram, Threads, LinkedIn
Pages, Pinterest, TikTok (public posts only), YouTube, Mastodon, Tumblr, Slack,
and Discord channels connected through the bot. Telegram reports no per-post
numbers, only a member count, and a LinkedIn personal profile is not measured.
X is measured only when the service has X read access switched on. The
answer's `unmeasuredPlatforms` field names each connected network it does not
measure at all, so a missing number is not mistaken for no reach.

## Other ways to connect

**Local MCP server (npm).** For clients that start a local process, the same
16 tools run from [`ihateposting-mcp`](https://www.npmjs.com/package/ihateposting-mcp):

```json
{
  "mcpServers": {
    "ihateposting": {
      "command": "npx",
      "args": ["-y", "ihateposting-mcp"],
      "env": { "IHATEPOSTING_API_KEY": "pk_live_…" }
    }
  }
}
```

`IHATEPOSTING_API_URL` changes the server it talks to (default
`https://ihateposting.com`).

**Command line.** [`ihateposting`](https://www.npmjs.com/package/ihateposting)
(`npm i -g ihateposting`, or `npx ihateposting <command>` without installing)
drafts, checks, schedules and publishes, uploads files off disk, and lists
posts. Its commands are `login`, `logout`, `whoami`, `accounts`, `platforms`,
`posts`, `upload`, `post` and `skill`; `ihateposting help` lists the commands
and the main flags.

```bash
ihateposting login <key>                                   # saved in ~/.ihateposting/config.json
ihateposting whoami                                        # which account the key belongs to
ihateposting accounts --json                               # connected accounts, with ids
ihateposting upload ./launch.mp4 --alt "Product demo"      # prints a media id
ihateposting post "text" --to bluesky,linkedin --check     # validates this draft, creates nothing
ihateposting post "text" --to instagram --media "$ID"      # draft with the uploaded file
ihateposting post "text" --to x --at "2026-10-01 9:00 AM" --check   # check the scheduled version first
ihateposting post "text" --to x --at "2026-10-01 9:00 AM"  # scheduled
ihateposting posts --status scheduled --from 2026-12-01 --to 2026-12-31   # prints the total too
ihateposting skill                                         # writes .claude/skills/ihateposting/SKILL.md
```

`--check` validates the command exactly as written, so give it the same
`--now` or `--at` you will post with. `--now` publishes at once. The command
line cannot set per-network options yet, so a Pinterest board or YouTube's
made-for-kids answer needs the MCP tools or the REST API. Every command exits
0 on success and 1 on failure. `ihateposting skill --print` prints the CLI's
own skill instead of writing it. The settings the command line and the npm
server read are listed in their own READMEs on npm
([ihateposting](https://www.npmjs.com/package/ihateposting),
[ihateposting-mcp](https://www.npmjs.com/package/ihateposting-mcp)).

**A URL with the key in it.** Some connector dialogs accept only a URL, with
no field for a header. For those, the server also reads the key from the
address: `https://ihateposting.com/mcp?key=pk_live_…`. A key in a URL can end
up in browser history, proxy logs and Referer headers, so use the header
whenever the client allows one, and make a new key if a URL containing it is
ever shared.

**MCP Registry.** The server is listed in the official MCP Registry as
`com.ihateposting/mcp`. That entry points at `https://ihateposting.com/api/mcp`,
which is the same server as `/mcp`.

## REST API and webhooks

The MCP tools are a thin layer over a public REST API, which takes the same
key as `Authorization: Bearer pk_live_…`:

| Method and path | Tool |
|-----------------|------|
| `GET /api/v1/accounts` | `list_accounts`, `whoami` |
| `GET /api/v1/platforms` | `get_platform_rules` |
| `POST /api/v1/posts/validate` | `validate_post` |
| `GET /api/v1/posts`, `POST /api/v1/posts` | `list_posts`, `create_post` |
| `GET`, `PATCH`, `DELETE /api/v1/posts/{id}` | `get_post`, `update_post`, `delete_post` |
| `POST /api/v1/posts/{id}/reschedule` | `reschedule_post` |
| `POST /api/v1/posts/{id}/retry` | `retry_post` |
| `GET /api/v1/media`, `POST /api/v1/media/presign`, `POST /api/v1/media/confirm`, `POST /api/v1/media/from-url` | `list_media`, `upload_media` |
| `GET /api/v1/pinterest/boards` | `list_pinterest_boards` |
| `GET /api/v1/analytics` | `get_analytics` |

Request and response shapes are in [docs/api.md](docs/api.md).

**Webhooks** tell another system when a post is done. Add them at
ihateposting.com under **Settings → Webhooks** (up to 10). Each receives a
signed `POST` for `post.published`, `post.partial` or `post.failed`:

- The `X-iHatePosting-Signature` header is `sha256=` followed by the
  HMAC-SHA256 of the raw body, keyed with that webhook's secret (`whsec_…`).
- The payload's `id` stays the same when a delivery is retried, so use it to
  drop duplicates.
- A webhook can be limited to chosen accounts. It then fires for posts that
  touched one of them and carries only those accounts' results.
- **Send test** delivers a sample payload of the same shape, marked with an
  `X-iHatePosting-Test: true` header.

The setup for Zapier, Make and n8n is in
[this guide](https://ihateposting.com/guides/connect-ihateposting-to-zapier-make-n8n).

## Limits

- **Requests per minute, per account:** 30 creates, 60 updates, 30
  reschedules, 15 retries, 60 validations, 60 analytics reads, 120 media
  listings, 60 Pinterest board lookups and 30 uploads. `list_posts`,
  `list_accounts`, `whoami` and `get_platform_rules` share 60 a minute. Going
  over returns HTTP 429; wait a minute and try again.
- **One post per `create_post` call**, with up to 20 media ids.
- **`list_posts` is paged.** 50 by default, 200 maximum. The reply carries
  `total` (matching your filter) and `returned` (this page), plus `hasMore`
  and `nextCursor`. Take counts from `total`, never from the page — and
  filter with `status` and `from`/`to` rather than counting rows.
- **The 90-day free trial.** Paid plans are not on sale yet; plans and what
  each includes are on the pricing page linked below.
- **X** is available on every plan within a monthly number of posts that
  depends on the plan, and a daily number. Links in X posts need a paid Pro
  plan; during the free trial, post to X without the link or give X its own
  text.

Plans and prices: [ihateposting.com/pricing](https://ihateposting.com/pricing).

## Troubleshooting

- **The tools are missing.** The agent is not signed in. On claude.ai and in
  Cowork, connect iHatePosting from the plugin's **Connectors** tab; in Claude
  Code, run `/mcp` and choose **Authenticate**; in Cursor, open **Customize**,
  then **MCPs**, turn iHatePosting on and press **Connect**; in Gemini CLI, run
  `/mcp auth ihateposting`; in Grok Build, open
  `/mcps` and press `i`; in Kimi Code, approve its `authenticate` step or run
  `/mcp-config login` with the name `/mcp` shows; in Qwen Code, open `/mcp`,
  select iHatePosting and choose **Authenticate**. None of these use a key.
- **Coming from 0.4.x on Cursor or Grok Build?** Those plugins used to send an
  API key. They now sign in instead, once, as above. The plugin no longer
  reads the key you set for 0.4.x, so you can remove it from Cursor's plugin
  settings or your shell profile. If nothing else uses that key, regenerate it
  under Settings → Developers so the old one stops working.
- **"No API key" from the command line or the npm server.** It was given no
  key. Run `ihateposting login <key>`.
- **"iHatePosting API 401" on a key-based setup.** The key is wrong, has been
  replaced by a newer one, or the client sent an unfilled placeholder instead
  of the key. Check the client's setting before assuming the key was revoked.
- **An account shows `needs_reauth`.** It has to be reconnected on the
  Accounts page at ihateposting.com; an agent cannot do that. Its pending
  sends are held, and go out once the same account is reconnected. A send
  still held 14 days after it was due fails instead; reconnect, then retry it.
- **HTTP 429.** A per-minute limit was reached (see [Limits](#limits)).
- **Posted to fewer networks than asked.** The `create_post` answer lists
  every requested name or id that matched no connected, active account under
  `unresolved`.
- **Some networks published and others failed.** The post's status is
  `partial`. `get_post` shows each network's error, and `retry_post` resends
  only the failed ones. A send can also be `skipped` when the publisher's last
  check refused it; fix the post rather than retrying.
- **Refused when creating or updating.** The message is the network's own
  rule, for example a caption over the limit or missing media. Fix it, or give
  that network an override, and send again. A draft skips these checks.
- **YouTube is refused.** It needs one video, a title, and the made-for-kids
  declaration: set `ytMadeForKids` to `true` or `false` in the `youtube`
  options. Privacy is public unless you set `ytPrivacy`.
- **Pinterest is refused.** A pin needs a board. Get the id from
  `list_pinterest_boards` and set it as `boardId` in the `pinterest` options.
  An empty list means the account has no boards yet; make one on Pinterest
  first.
- **TikTok went to the wrong audience, or not at all.** Without
  `tiktokPrivacy`, a post sent through the agent or the API goes to the widest
  audience TikTok offers that account, which is public for a public account.
  Set it to `public`, `followers`, `friends` or `private`. With
  `tiktokSendAsDraft`, the video goes to the creator's TikTok inbox and is
  reported as done, but it is only public once they post it in the TikTok
  app.

## Network endpoints and credentials

- Every agent in this package calls one address,
  `https://ihateposting.com/mcp/oauth`: MCP over Streamable HTTP, with OAuth
  sign-in. It sends no key. Each agent discovers the sign-in from the
  server's own metadata, uses PKCE and registers itself, then keeps its own
  token (Gemini CLI in `~/.gemini/mcp-oauth-tokens.json`, Grok Build in
  `~/.grok/mcp_credentials.json`, Kimi Code under
  `~/.kimi-code/credentials/mcp/`, Qwen Code in
  `~/.qwen/mcp-oauth-tokens.json`). Revoke a sign-in at ihateposting.com under
  Settings → Developers.
- `https://ihateposting.com/mcp` is the same server for key-based setups (the
  local npm server, agents that cannot sign in), which send
  `Authorization: Bearer <key>`. Nothing in this package uses it.
- There are no hooks and no install scripts, and nothing runs on your machine.
- What the server receives: the text, media and options of the posts you ask
  for, and the requests to list, check, change or report on them. It sends
  them on to the social networks you chose, through each network's official
  API. The privacy policy is at
  [ihateposting.com/privacy](https://ihateposting.com/privacy).

## What is in this repository

| Path | For |
|------|-----|
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `mcp.claude.json` | Claude (claude.ai, Cowork, Claude Code) |
| `.cursor-plugin/plugin.json`, `mcp.cursor.json` | Cursor |
| `gemini-extension.json` | Gemini CLI |
| `.grok-plugin/plugin.json`, `.grok-plugin/marketplace.json`, `mcp.grok.json` | Grok Build |
| `.kimi-plugin/plugin.json` | Kimi Code |
| `qwen-extension.json` | Qwen Code |
| [assets/logo.svg](assets/logo.svg) | The logo Cursor and Grok Build show |
| `skills/ihateposting/SKILL.md` | All six: how to post safely |
| `skills/ihateposting/references/platform-options.md` | All six: each network's option keys, loaded when needed |
| `clawhub/ihateposting/SKILL.md` | OpenClaw and Hermes Agent, through ClawHub: the same guidance for a server added by hand |
| `clawhub/ihateposting/references/platform-options.md` | The same file as the plugin's, for the ClawHub copy |
| `docs/platforms.md` | What each network accepts, in full |
| `docs/api.md` | The REST API |
| `examples/` | Draft `create_post` payloads and how to use them |
| `scripts/check.mjs`, `.github/workflows/check.yml` | The release check, run on every push |
| `.github/workflows/release.yml` | Publishes a GitHub Release, with its changelog notes, for every version tag |
| `CHANGELOG.md` | What changed in each release |

Each agent has its own MCP file, so that each manifest names exactly one
server; all of them point at the same sign-in address. There is deliberately
no `.mcp.json` at the root, so no tool picks up a server this package did not
mean to give it.

`node scripts/check.mjs` checks the manifests, the key handling, the skill and
the examples before a release. It also checks that this README names every
tool and network, and that every example is a draft.

## Feedback and issues

Report a problem or ask for something in
[this repository's issues](https://github.com/iHatePostingOrg/agent-skill/issues),
or write to us from [ihateposting.com/contact](https://ihateposting.com/contact).

## Links

- Website: [ihateposting.com](https://ihateposting.com)
- Set-up pages for every agent: [ihateposting.com/ai-agents](https://ihateposting.com/ai-agents)
- Setup guide: [Post to social media from an AI agent](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent)
- REST API: [docs/api.md](docs/api.md)
- Pricing: [ihateposting.com/pricing](https://ihateposting.com/pricing)
- Privacy policy: [ihateposting.com/privacy](https://ihateposting.com/privacy)
- Terms: [ihateposting.com/terms](https://ihateposting.com/terms)

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
