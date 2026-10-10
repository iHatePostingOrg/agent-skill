---
name: ihateposting-cli
description: Draft, check, schedule and publish social posts across 14 platforms (Bluesky, X, LinkedIn, Facebook, Instagram, Threads, Pinterest, TikTok, YouTube, Mastodon, Telegram, Discord, Tumblr, Slack) using the iHatePosting CLI. Use when asked to post, schedule, draft, or review what is going out.
license: MIT
compatibility: Needs the iHatePosting CLI (npm install -g ihateposting), signed in with ihateposting login, and network access to ihateposting.com.
metadata:
  last-updated: "2026-10-10"
  homepage: "https://ihateposting.com/settings#developers"
---

# Posting with iHatePosting

The `ihateposting` command posts to the user's connected social accounts.

## Before anything else

**`--now` publishes immediately to a real audience and cannot be undone.**
Never use it unless the user asked for it in this conversation, in words.
Without it every post is saved as a draft, which is always safe.

## Setup

```bash
npm install -g ihateposting
ihateposting login <key>        # from Settings -> Developers
```

In CI there is nothing to log into — set `IHATEPOSTING_API_KEY` and every
command below works unchanged.

## Find out what is possible before composing

```bash
ihateposting accounts     # which accounts are connected, and their state
ihateposting platforms    # per-platform limits, required fields, media rules
```

Only platforms listed by `accounts` with status `active` can receive a post.
`needs_reauth` means the user must reconnect it first — say so rather than
trying to post to it.

## Always check before you post

```bash
ihateposting post "your text" --to x,linkedin --now --check
```

`--check` creates nothing. It runs the same validation the publisher runs, so
what it says is what will really happen: character counts (X weights links and
CJK differently), missing media, missing required fields, accounts that are
signed out, and the account's own limits — an ended trial, a plan that does not
include X, a monthly allowance that is already full. Fix what it reports, then
post. Exit code 1 means something would have stopped the post.

USE THE SAME FLAGS YOU ARE ABOUT TO POST WITH — `--now` or `--at`, any
picture you are attaching, and any `--option` (see below). A check with none
of them is a check of a DRAFT, and a draft is never capped: the limits count
the month a post is due, so leaving the date out asks a different question and
gets a cheerful answer to it.

## Pictures and video

Upload the file first, then attach it by the id you get back.

```bash
ihateposting upload photo.jpg                          # prints the media id
ihateposting post "text" --to instagram --media <id>
```

`upload` prints the id and nothing else, so it goes straight into `--media`.
Add `--alt "what is in the picture"` when you upload; several networks publish
it.

`--media` takes library ids and nothing else — a file path or a web address
given there is not a mistake we can correct for you, it simply will not
attach.

We take .jpg, .jpeg, .png, .webp, .gif, .mp4, .mov and .webm. Anything else is
refused before the file is read.

**If the file exists only in this conversation — pasted or attached, with no
copy on disk — you cannot upload it.** Do not try to reproduce its bytes: what
you write out is your own output, it gets cut short, and the result is a
corrupt file that our server will reject after you have spent several minutes
on it. Say so, and offer the two routes that work: the user saves the file to
disk and you upload it, or the user uploads it in iHatePosting and you find it
afterwards with `ihateposting posts` or the media library.

## Posting

```bash
ihateposting post "text" --to bluesky,mastodon                       # draft (default)
ihateposting post "text" --to linkedin --at "2026-09-01 9:00 AM"     # scheduled, user's timezone
ihateposting post "text" --to x --now                                # PUBLISHES — ask first
```

`--to` takes platform names or the account ids from `ihateposting accounts`.
A name fans out to every connected account on that platform; use an id when
the user has two accounts on one platform and means a particular one.

## Platform settings

Some platforms need a setting before they will post — YouTube asks whether the
video is made for kids, Pinterest needs a board. Give each one with
`--option <platform>.<key>=<value>`, as many times as needed, and give the
same ones to `--check`:

```bash
ihateposting boards       # Pinterest board ids
ihateposting post "text" --to youtube,pinterest --media <id> --at "2026-09-01 9:00 AM" --option youtube.ytMadeForKids=no --option pinterest.boardId=<board> --check
```

`ihateposting platforms` names the settings each platform requires. Key names
are exact. `true`/`false` are switches, `'["a","b"]'` is a list, and
anything else is sent as text. When `--check` reports a missing setting it
prints the `--option` that sets it. A flag `post` does not know is refused,
never ignored — put platform settings in `--option`.

## Reviewing

```bash
ihateposting posts            # recent posts and their status
ihateposting posts --json     # same, machine readable
```

`--json` is available on `accounts`, `platforms`, `boards` and `posts` when you
need to read the output rather than show it.

## Writing the post itself

- Write for the platform the user named. Do not reuse one text everywhere
  without saying that is what you did.
- Do not add hashtags, emoji or a call to action unless asked.
- Never invent a link. If a URL is needed and you do not have it, ask.
- If `--check` says a post is too long, shorten the text — do not silently
  drop a platform the user asked for.

## When something fails

Report the message the CLI printed, verbatim. It is written for a person and
usually names the fix ("Reconnect it on the Accounts page"). Do not retry a
failed publish without asking — the first attempt may have partly succeeded.
