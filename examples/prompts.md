# Things to ask your agent

These are requests you can type into Claude Code, Cursor, Gemini CLI or Grok
Build once the iHatePosting plugin is installed. Each one lists the tools the
agent calls, in order. A request that does not say "now" or give a time ends
in a draft.

## Writing and saving drafts

**1. "Turn this changelog into an X thread and a LinkedIn post, and save both
as drafts."**
`get_platform_rules` → `list_accounts` → `validate_post` → `create_post`.
One post with the LinkedIn wording in `text` and the thread in
`options.x.threadSegments`, as in
[thread-x-bluesky.json](thread-x-bluesky.json).

**2. "Write one announcement for LinkedIn and Facebook, with shorter versions
for X, Bluesky and Threads."**
`get_platform_rules` → `validate_post` → `create_post` with `overrides`, as
in [per-platform-overrides.json](per-platform-overrides.json).

**3. "Check whether this fits on X, Bluesky and Mastodon. Don't save
anything."**
`validate_post` only. It creates nothing and answers with each platform's
problems, if any.

**4. "Post this photo to Instagram and Threads, with the hashtags in the
first comment. Draft only."**
`upload_media` (for a file of 8 MB or less) or `list_media` → `validate_post`
→ `create_post` with `options.instagram.firstComment` and
`options.threads.firstComment`.

**5. "Pin the checklist image to my Houseplants board and link it to our
repotting guide."**
`list_pinterest_boards` → `list_media` → `validate_post` → `create_post`, as
in [pinterest-pin.json](pinterest-pin.json). The agent asks for the guide's
URL if you have not given it.

**6. "Draft a YouTube upload of the video I added this morning. Keep it
private and mark it as not made for kids."**
`list_media` → `validate_post` → `create_post`, as in
[youtube-upload.json](youtube-upload.json).

**7. "Share the release note on our company LinkedIn Page only, not on my
personal profile."**
`list_accounts` (to find the Page's account id) → `validate_post` →
`create_post` with that id in `platforms`, as in
[linkedin-page-post.json](linkedin-page-post.json).

**8. "Draft a TikTok for the clip I uploaded. Comments on, Duets and
Stitches off."**
`list_media` → `validate_post` → `create_post`, as in
[tiktok-video.json](tiktok-video.json). The agent asks who should see it,
because a TikTok post with no audience set goes to the widest one TikTok
allows the account.

## Scheduling and changing posts

**9. "Schedule the draft about the community call for Thursday at 9:00 AM."**
`list_posts` → `get_post` → `validate_post` → `reschedule_post`.
Rescheduling a draft makes it a scheduled post that will publish, and it skips
the platform checks `create_post` runs, so the agent validates first. The time is read
in your iHatePosting timezone.

**10. "Move tomorrow's LinkedIn post to Friday at 10:00 AM."**
`list_posts` → `reschedule_post`. A post that has already published cannot be
moved.

**11. "Fix the typo in the Bluesky post that goes out this afternoon."**
`list_posts` → `get_post` → `update_post`. `update_post` replaces the whole
post, so the agent sends back every account, option and media id it read
with `get_post`, with `"action": "schedule"` and the same date and time. A
post saved as a group for several platforms cannot be
edited this way; the agent says so, and can delete it and create it again.

**12. "Delete the draft about the webinar."**
`list_posts` → `delete_post`. Deleting a scheduled post stops it from going
out. Deleting a published post never removes it from the network, and the
agent says so before it deletes one.

## Checking what happened

**13. "What's going out this week, and did anything fail?"**
`list_posts`. It returns the 50 most recent posts with each platform's
status, live URL or error, and the agent picks out this week's.

**14. "Why did my TikTok post fail? If it's fixable, try again."**
`get_post` → `retry_post`. `get_post` shows the error text for each platform.
`retry_post` resends only the sends that failed; the agent asks before
retrying, and if the account needs reconnecting it tells you instead.

**15. "Which of my accounts need reconnecting?"**
`list_accounts`. An account marked `needs_reauth` has to be reconnected on
the Accounts page at ihateposting.com before it can post.

**16. "How did my posts do over the last 30 days, and which network worked
best?"**
`get_analytics` with `range: "30d"`. Networks that report no numbers are
named in `unmeasuredPlatforms` and left out of the totals, so their absence
means "not measured", not "no reach".

**17. "Which iHatePosting account is this key for?"**
`whoami`. It returns your iHatePosting login, not a social media handle.

## Publishing on request

**18. "Post this to Bluesky now."**
`validate_post` → `create_post` with `"action": "now"`. The agent publishes
at once only because the request says "now"; without that word it saves a
draft.
