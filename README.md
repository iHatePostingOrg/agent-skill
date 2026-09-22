<img src="assets/logo.png" alt="iHatePosting logo" width="72">

# iHatePosting for AI agents

Let Claude Code, Cursor, Gemini CLI or Grok Build draft, check, schedule and
publish posts on 14 social networks, using the accounts you have connected at
[ihateposting.com](https://ihateposting.com). This package gives each agent
the hosted iHatePosting MCP server (15 tools) and a skill that teaches it to
post safely.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm: ihateposting-mcp](https://img.shields.io/npm/v/ihateposting-mcp?label=ihateposting-mcp)](https://www.npmjs.com/package/ihateposting-mcp)
[![npm: ihateposting](https://img.shields.io/npm/v/ihateposting?label=ihateposting)](https://www.npmjs.com/package/ihateposting)

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

The hosted server offers these 15 tools. The last column is what a tool does
to your posts and accounts.

| Tool | What it does | Effect |
|------|--------------|--------|
| `whoami` | Names the iHatePosting login the key belongs to (email and account name), not a social handle | Reads |
| `list_accounts` | Lists connected social accounts with platform, handle, status and id | Reads |
| `get_platform_rules` | Each network's character limit, media rules, video formats and length, and required options | Reads |
| `validate_post` | Checks a post against every network you name, without creating anything | Reads |
| `create_post` | Creates a post: a draft by default, or `now` or `schedule` when asked | Creates; publishes with `now` or `schedule` |
| `list_posts` | The 50 newest posts, with each network's status and live URL | Reads |
| `get_post` | One post in full: text, per-network copy and options, media, and each send's result or error | Reads |
| `update_post` | Replaces a draft, scheduled or failed post with what you send | Changes; publishes with `now` or `schedule` |
| `reschedule_post` | Moves a draft or scheduled post to a new date and time | Publishes at the new time, including a draft |
| `retry_post` | Sends again only what failed, on one network or all of them | Publishes |
| `delete_post` | Removes iHatePosting's record of a post; a published post needs `force` | Deletes; never unpublishes |
| `list_media` | Your media library, newest first, with the ids posts attach | Reads |
| `upload_media` | Adds an image or video (base64, up to 8 MB) to the library and returns its id | Creates a library file |
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

Get an API key first ([below](#get-an-api-key)), then pick your agent.

| Agent | How it installs | Where the key goes |
|-------|-----------------|--------------------|
| Claude Code | `/plugin install` from this repository's marketplace | Asked for at install, stored as a secret |
| Cursor | Cursor Marketplace once listed, or `~/.cursor/mcp.json` | `IHATEPOSTING_API_KEY` |
| Gemini CLI | `gemini extensions install` | Asked for at install, kept in your system keychain |
| Grok Build | `grok plugin install ... --trust` | `IHATEPOSTING_API_KEY` in your environment |
| ChatGPT, Claude on the web and others | Their own MCP settings | See the [setup guide](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent) |

<details>
<summary><strong>Claude Code</strong></summary>

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

</details>

<details>
<summary><strong>Cursor</strong></summary>

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

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

```bash
gemini extensions install https://github.com/iHatePostingOrg/agent-skill
```

Gemini CLI asks for your API key during the install and keeps it in your
system keychain. Change it later with `gemini extensions config ihateposting`.
The extension uses `url` with `type: "http"`, the form Gemini CLI 0.21 and
later reads as Streamable HTTP.

</details>

<details>
<summary><strong>Grok Build</strong></summary>

Grok Build cannot ask for a secret, so the key comes from your environment.
Set it in the shell that starts `grok`, then install:

```bash
export IHATEPOSTING_API_KEY=pk_live_...
grok plugin install iHatePostingOrg/agent-skill --trust
```

A plugin's MCP server stays off until the plugin is trusted, which is what
`--trust` does.

</details>

<details>
<summary><strong>Other agents</strong></summary>

ChatGPT, Claude on the web and desktop, VS Code with GitHub Copilot, Codex,
Windsurf, Zed, Cline, OpenClaw and more connect to the same server without
this package. The setup for each is at
[ihateposting.com/guides/post-to-social-media-from-an-ai-agent](https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent).

OpenClaw's documentation says it reads a package with a `.cursor-plugin/`
folder as a Cursor bundle, so installing this repository there is not
expected to add the MCP server. Use OpenClaw's own MCP setup from the guide
instead.

</details>

## Get an API key

Sign in at [ihateposting.com](https://ihateposting.com), open **Settings →
Developers** and create a key. It starts with `pk_live_` and is shown in full
only once, so copy it then. There is one key per account: making a new one
switches the old one off everywhere it is used. The key can post on your
behalf, so keep it out of chats, screenshots and shared files.

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
- **Scheduling a multi-network post splits it.** When `update_post` schedules
  or publishes a post that targets more than one account, it becomes one post
  per account. After that, `update_post` refuses them, and `reschedule_post`
  and `delete_post` act on one of them at a time.
- **Deleting never unpublishes.** `delete_post` removes iHatePosting's record
  only. A published post is refused unless `force` is set, and it stays live on
  the network. A post that is publishing right now cannot be deleted.
- **Retry only resends what failed.** A send that published is left alone.
  A network can report a failure for a post that went live anyway, so check
  the network before retrying.
- **Approval prompts depend on the agent.** In Claude Code the skill
  pre-approves only the tools that read, so anything that creates, changes,
  publishes or deletes asks first unless your own permission settings allow
  it. Cursor, Gemini CLI and Grok Build apply their own approval settings.

## Media

- `upload_media` takes the file as base64, with an optional alt text, and
  returns a library id to put in `mediaIds`. Through the agent the limit is
  8 MB. Images can be JPEG, PNG, WebP or GIF; videos can be MP4, MOV or WebM.
- `list_media` returns ids, sizes and dimensions of what is already uploaded,
  never a download link.
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
15 tools run from [`ihateposting-mcp`](https://www.npmjs.com/package/ihateposting-mcp):

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
(`npm i -g ihateposting`) posts text only; it has no media option. Its
commands are `login`, `logout`, `whoami`, `accounts`, `platforms`, `posts`,
`post` and `skill`:

```bash
ihateposting login <key>                                   # saved in ~/.ihateposting/config.json
ihateposting post "text" --to bluesky,linkedin --check     # validates, creates nothing
ihateposting post "text" --to bluesky,linkedin             # draft
ihateposting post "text" --to x --at "2026-10-01 9:00 AM"  # scheduled
ihateposting skill                                         # writes .claude/skills/ihateposting/SKILL.md
```

In CI, set `IHATEPOSTING_API_KEY` instead of running `login`. `--now`
publishes at once. `ihateposting skill --print` prints the CLI's own skill
instead of writing it.

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
| `GET /api/v1/media`, `POST /api/v1/media/presign`, `POST /api/v1/media/confirm` | `list_media`, `upload_media` |
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
- **`list_posts` returns the 50 newest posts**, with no filters or
  paging.
- **The 90-day free trial.** Paid plans are not on sale yet; plans and what
  each includes are on the pricing page linked below.
- **X** is available on every plan within a monthly number of posts that
  depends on the plan, and a daily number. Links in X posts need a paid Pro
  plan; during the free trial, post to X without the link or give X its own
  text.

Plans and prices: [ihateposting.com/pricing](https://ihateposting.com/pricing).

## Troubleshooting

- **The tools are missing, or say "No API key".** The client sent no key. In
  Claude Code, run `/plugin configure ihateposting@ihateposting` in terminal
  Claude Code. In Gemini CLI, run `gemini extensions config ihateposting`. In
  Cursor and Grok Build, set `IHATEPOSTING_API_KEY`.
- **"iHatePosting API 401".** The key is wrong, has been replaced by a newer
  one, or the client sent an unfilled placeholder instead of the key. Check
  the client's setting before assuming the key was revoked.
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

- This package calls exactly one endpoint: `https://ihateposting.com/mcp`, MCP over
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
| `skills/ihateposting/SKILL.md` | All four: how to post safely |
| `skills/ihateposting/references/platform-options.md` | All four: each network's option keys, loaded when needed |
| `docs/platforms.md` | What each network accepts, in full |
| `docs/api.md` | The REST API |
| `examples/` | Draft `create_post` payloads and how to use them |
| `scripts/check.mjs`, `.github/workflows/check.yml` | The release check, run on every push |
| `CHANGELOG.md` | What changed in each release |

Each agent has its own MCP file because each fills in the key differently:
Claude Code from the plugin's settings (`${user_config.api_key}`), and the
others from `IHATEPOSTING_API_KEY`. There is deliberately no `.mcp.json` at the
root. Directories that read one would install a server with an unfilled
placeholder in place of a key.

`node scripts/check.mjs` checks the manifests, the key handling, the skill and
the examples before a release. It also checks that this README names every
tool and network, and that every example is a draft.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
