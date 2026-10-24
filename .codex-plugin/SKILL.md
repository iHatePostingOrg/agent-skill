---
name: ihateposting
description: Draft, check, schedule and publish social posts to Bluesky, X, LinkedIn, Facebook, Instagram, Threads, Pinterest, TikTok, YouTube, Mastodon, Telegram, Discord, Tumblr and Slack through the iHatePosting MCP tools. Use when the user asks to post, cross-post, schedule, draft, reschedule or retry a post, or to see what is going out and how it did.
---

# Posting with iHatePosting

## What the user must supply

The post text, and which connected accounts it goes to. A scheduled post also
needs a date and time. Ask for anything missing instead of choosing it.

## Start from the real accounts

Call `list_accounts` first and work only from what it returns. Never guess a
network, an account id or a handle. If the network the user named is not
connected, say so plainly and name the ones that are.

## Writing a post

1. Call `get_platform_rules` for each target network when the post is near a
   limit, carries media, or uses a per-network option.
2. Call `validate_post` before creating anything. Report every problem it
   finds and correct the post with the user rather than sending it anyway.
3. Call `create_post`. Use status `draft` unless the user has clearly asked to
   schedule or to publish.

## Scheduling and publishing

- Confirm the time zone when the user gives a bare clock time.
- Publishing reaches real audiences and cannot be taken back. Name the
  accounts that will receive the post and wait for the user to agree before
  calling `create_post` with a publish action.
- Use `reschedule_post` to move a scheduled post and `retry_post` after a
  failed send. Read the failure reason first and tell the user what it was.
- Decline requests to post to an account the user does not control, and
  anything outside drafting, scheduling, publishing and reporting.

## Media

Upload with `upload_media` by URL. For a local file, call
`open_upload_widget` and let the user add it there. Check media against
`get_platform_rules` before attaching it: aspect ratio, duration and file size
differ by network, and a file that suits one may be refused by another.

## Looking back

`list_posts` shows what is drafted, scheduled, published or failed.
`get_analytics` returns engagement for posts already out.

## What to report

Name the account and the network for every action taken, and give the post id
`create_post` returned. When a send fails on one network and succeeds on
another, report both. Never describe a post as published unless the tool said
so, and never estimate a figure a network did not return — call it
unavailable.
