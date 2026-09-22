---
name: ihateposting
description: Draft, check, schedule and publish social posts to Bluesky, X, LinkedIn, Facebook, Instagram, Threads, Pinterest, TikTok, YouTube, Mastodon, Telegram, Discord, Tumblr and Slack through the iHatePosting MCP tools. Use when the user asks to post, cross-post, schedule, draft, reschedule or retry a post, or to see what is going out and how it did.
license: MIT
compatibility: Needs an iHatePosting API key (pk_live_...) and network access to ihateposting.com. Uses the iHatePosting MCP server this plugin adds; the ihateposting CLI (npm i -g ihateposting) is a fallback for text-only posts.
metadata:
  last-updated: "2026-09-22"
  homepage: "https://ihateposting.com/guides/post-to-social-media-from-an-ai-agent"
allowed-tools: mcp__plugin_ihateposting_ihateposting__whoami mcp__plugin_ihateposting_ihateposting__list_accounts mcp__plugin_ihateposting_ihateposting__get_platform_rules mcp__plugin_ihateposting_ihateposting__validate_post mcp__plugin_ihateposting_ihateposting__list_posts mcp__plugin_ihateposting_ihateposting__get_post mcp__plugin_ihateposting_ihateposting__list_media mcp__plugin_ihateposting_ihateposting__list_pinterest_boards Bash(ihateposting whoami *) Bash(ihateposting accounts *) Bash(ihateposting platforms *) Bash(ihateposting posts *)
---

# Posting with iHatePosting

iHatePosting sends posts to the social accounts the user has connected at
ihateposting.com. This plugin gives you its tools over MCP (server
`ihateposting`). Everything below uses those tools; the command-line
equivalents are at the end.

## Rule one: nothing goes live unless the user said so

- `create_post` saves a **draft** by default. Keep it that way unless told
  otherwise.
- `action: "now"` publishes at once, to a real audience, and cannot be taken
  back. Use it only when the user asked, in this conversation and in words,
  for the post to go out now.
- `action: "schedule"` also publishes, just later. Confirm the date and time
  with the user first.
- When the user's intent is unclear, save a draft and say that you did.

This skill pre-approves only the tools that read. Unless the user's own
permission settings already allow them, you will be asked before anything
that creates, changes, publishes or deletes.

## Check the key first

If none of the iHatePosting tools are available, the API key was probably
never entered. In Claude Code, that happens after an install from the VS Code
extension, the desktop app or a plain shell: tell the user to run
`/plugin configure ihateposting@ihateposting` in terminal Claude Code. In
Gemini CLI it is `gemini extensions config ihateposting`; in Grok Build and
Cursor the key comes from the `IHATEPOSTING_API_KEY` setting.

Otherwise call `whoami`. What it returns is the user's iHatePosting login,
not a social media handle — the handles from `list_accounts` belong to the
connected profiles and may carry other people's names.

- "No API key" means the client sent no key at all.
- "iHatePosting API 401" means the key is wrong or has been replaced, or the
  client sent an unfilled placeholder in place of the key. Check that the key
  is set in the client before assuming it was revoked.

A new key is created at ihateposting.com under Settings > Developers. Never
ask the user to paste a key into the chat.

## Before you write anything

1. `list_accounts` shows what is connected. Only an `active` account can
   receive a post. `needs_reauth` means the user has to reconnect it on the
   Accounts page — say that instead of posting to it.
2. `get_platform_rules` gives each platform's character limit, media rules
   and MANDATORY options. Pinterest needs a board (`list_pinterest_boards`),
   YouTube needs a title and a video, and Instagram and TikTok need media.

## Always validate, then create

`validate_post` runs the checks the publisher runs and creates nothing. Call
it with the exact text, platforms and media you intend to send, fix what it
reports, then call `create_post`.

- `create_post` `platforms` takes a platform name (every account on that
  platform) or an account id from `list_accounts` (exactly that account).
- `validate_post` takes platform NAMES only. Never pass an account id there.
- Scheduling: `action: "schedule"` with `scheduledDate` (YYYY-MM-DD) and
  `scheduledTime` (for example `9:00 AM`). Times are read in the account
  owner's iHatePosting timezone, not the user's device.
- Different text for one platform goes in `overrides`; per-platform settings,
  such as a Pinterest board, go in `options`.
- Media: attach library ids through `mediaIds`, in order. `list_media` shows
  what is already in the library. `upload_media` takes the file as base64,
  which suits images; large video is not practical that way.

## Changing things

- `update_post` REPLACES the whole post. Read it with `get_post` first and
  send everything back — anything you leave out is removed. It takes
  `accountIds` (ids from `list_accounts`, never platform names), `baseContent`
  and `action`, all required.
- `reschedule_post` moves a scheduled post. A post that has already published
  cannot be moved.
- `retry_post` resends only the sends that failed. Ask first: a network can
  report a failure for a post that went live anyway.
- `delete_post` removes iHatePosting's record only. It never unpublishes, and
  it refuses a published post unless told to go ahead. Tell the user the post
  will stay live on the network before deleting anything that went out.

## Writing the post

- Write for the platform the user named. If you reuse one text everywhere,
  say that you did.
- Add no hashtags, emoji or call to action unless asked.
- Never invent a link. If a URL is needed and you do not have it, ask.
- If a post is too long for one platform, shorten it or give that platform an
  override. Do not quietly drop a platform the user asked for.

## Afterwards

`list_posts` shows recent posts with each platform's status and live URL;
`get_post` shows one in detail; `get_analytics` shows how posts performed. A
post can succeed on some platforms and fail on others. Report each platform's
result, and the error text exactly as returned — it usually names the fix.

## Command-line fallback

If the MCP tools are unavailable and the `ihateposting` command is installed,
the same work can be done for text posts. The CLI has no option for media.

```bash
ihateposting whoami
ihateposting accounts                                      # add --json to read the output
ihateposting platforms
ihateposting post "text" --to bluesky,linkedin --check     # validates, creates nothing
ihateposting post "text" --to bluesky,linkedin             # draft
ihateposting post "text" --to x --at "2026-10-01 9:00 AM"  # scheduled
ihateposting post "text" --to x --now                      # PUBLISHES: ask first
ihateposting posts
```

The CLI reads its key from `ihateposting login <key>`, or from the
`IHATEPOSTING_API_KEY` environment variable.
