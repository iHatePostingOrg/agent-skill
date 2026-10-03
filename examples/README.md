# Examples

Each `.json` file in this folder is a complete set of arguments for the
`create_post` tool. The same file also works as the request body for
`POST https://ihateposting.com/api/v1/posts`. Every example uses
`"action": "draft"`, so it saves a draft and publishes nothing.

- [prompts.md](prompts.md) lists requests you can give your agent, and the
  tools it calls for each one.
- Values written in capitals, such as `VIDEO_ID_FROM_list_media`, are
  placeholders. Replace them with real ids before you send a file.

## Replace the placeholders

| Placeholder | Where the real value comes from |
|---|---|
| Any `…_ID_FROM_list_media` (`IMAGE_ID_…`, `VIDEO_ID_…`, `IMAGE_OR_VIDEO_ID_…`, `IMAGE_ID_1_…`, `JPEG_OR_WEBP_ID_1_…` and so on) | `list_media` (files already in your library), or `upload_media` with a `url` for a new file (up to 100 MB; images up to 25 MB) |
| `BOARD_ID_FROM_list_pinterest_boards` | `list_pinterest_boards` |
| `LINKEDIN_PAGE_ACCOUNT_ID_FROM_list_accounts` | the `id` of that account in `list_accounts` |

Check the result with `get_post` after you create a post. Leftover
placeholders do not always cause an error:

- A media id that is not in your library is dropped from the post without
  an error.
- A platform entry that matches no connected, active account comes back in
  the `unresolved` list of the `create_post` response. The request is
  refused only when no entry matches any account.

## Validate first, then create

`validate_post` runs the same checks the publisher runs and creates nothing.
Its arguments are shaped a little differently from `create_post`, so convert
them before you call it:

| `create_post` | `validate_post` |
|---|---|
| `text` | `text` |
| `platforms` (names or account ids) | `targets[].platform` (platform names only) |
| `overrides.<platform>` | `targets[].contentOverride` |
| `options.<platform>` | `targets[].options` |
| `mediaIds` | `mediaIds` |

For [pinterest-pin.json](pinterest-pin.json), the check looks like this:

```json
{
  "text": "A one-page checklist for repotting houseplants: pick the pot, loosen the roots, water last.",
  "targets": [
    {
      "platform": "pinterest",
      "options": {
        "boardId": "BOARD_ID_FROM_list_pinterest_boards",
        "title": "Repotting checklist for houseplants",
        "link": "https://example.com/repotting-checklist"
      }
    }
  ],
  "mediaIds": ["IMAGE_ID_FROM_list_media"]
}
```

The answer is `{ "ok": true, "issues": {} }` when nothing is wrong. Otherwise
`issues` lists, for each platform, a `code`, a `message` and sometimes the
`field` to fix. It also reports a platform that has no connected account, or
one whose account needs reconnecting. Issues with `"severity": "warn"` do not
stop a post from being created. Fix the rest, check again, then call
`create_post`.

When a post goes to a single account by id, as in
[linkedin-page-post.json](linkedin-page-post.json), validate it under that
account's platform name (`linkedin`).

## The examples

| File | What it shows |
|---|---|
| [thread-x-bluesky.json](thread-x-bluesky.json) | A four-part thread on X and on Bluesky, with X replies limited to people you follow. |
| [instagram-reel-first-comment.json](instagram-reel-first-comment.json) | An Instagram Reel whose hashtags go in the first comment. |
| [instagram-story.json](instagram-story.json) | An Instagram Story: one image or video, no caption. |
| [instagram-trial-reel.json](instagram-trial-reel.json) | An Instagram Reel posted as a trial reel, shown to non-followers first. |
| [instagram-carousel.json](instagram-carousel.json) | Five images as a carousel on Instagram and Threads, and as a four-image post on Bluesky. |
| [youtube-upload.json](youtube-upload.json) | A private YouTube upload with its title, audience declaration, tags and category. |
| [pinterest-pin.json](pinterest-pin.json) | A pin on a chosen board, with a title and a link. |
| [facebook-reel.json](facebook-reel.json) | A video posted as a Facebook Reel. |
| [linkedin-multi-image.json](linkedin-multi-image.json) | Four images in one LinkedIn post, to every connected LinkedIn account. |
| [linkedin-page-post.json](linkedin-page-post.json) | An image post to one LinkedIn account (a Company Page), with a first comment. |
| [tiktok-video.json](tiktok-video.json) | A TikTok video with its audience and interaction settings. |
| [tiktok-photos.json](tiktok-photos.json) | A TikTok photo post with music added by TikTok. |
| [per-platform-overrides.json](per-platform-overrides.json) | One announcement, with shorter wording for X, Bluesky and Threads. |
| [chat-channels-announcement.json](chat-channels-announcement.json) | One message to Telegram, Discord, Slack and Mastodon. |

### thread-x-bluesky.json

`options.<platform>.threadSegments` turns a post into a thread: the first
segment is the post, and each later one replies to the one before it. With
two or more segments, the segments are what gets posted on that platform, not
`text`, so repeat the opening in `text`. X counts each segment against 280
characters, Bluesky against 300. Threads and Mastodon read `threadSegments`
too. `lang` sets the language tag on the Bluesky posts. `xReplySettings`
limits who can reply on X (`following`, `mentioned`, `subscribers` or
`verified`); it applies to the first post of the thread, and leaving it out
lets everyone reply.

The X segments contain no links. On a plan that does not include links on
X, a link in the X text or in any X segment makes `create_post` refuse the
request, drafts included.

### instagram-reel-first-comment.json

A single video on Instagram always posts as a Reel. `igType: "reel"` keeps it
out of the profile grid, so it shows only in the Reels tab. Leave `igType`
out, or set it to `"feed"`, to show it in the grid as well. `"story"` posts a
Story, which takes one image or video, has no caption and gets no first
comment. The `firstComment` is posted as a comment right after the Reel is
published. Instagram refuses a caption with more than 30 hashtags, and the
first comment is where the rest can go.

### instagram-story.json

`igType: "story"` posts a Story. It takes exactly one image or video. The
API still needs some `text`, but Instagram shows no caption on a Story, so
keep the words in the image. A Story gets no first comment.

### instagram-trial-reel.json

`igTrialReel: true` posts a single-video Reel as a trial reel, which
Instagram shows to people who do not follow the account first.
`igGraduation` decides what happens next: `manual` (the default) leaves it to
the creator in the Instagram app, and `auto` lets Instagram share it with
followers if it does well. It applies to a Reel only, never to a feed post.

### instagram-carousel.json

Two or more files on Instagram make a carousel of up to 10 items, and images
and videos can be mixed. Threads takes up to 20 items. Bluesky takes 4
images, so it posts the first four. The order of `mediaIds` is the order on
every network. Alt text is set on the file itself (`upload_media` takes
`altText`), and Instagram, Threads and Bluesky all publish it.

### youtube-upload.json

`text` becomes the video description. `ytTitle` (up to 100 characters) and
`ytMadeForKids` (`true` or `false`) are both required; without either, the
post cannot be scheduled or published. `ytPrivacy` takes `public`,
`unlisted` or `private`, and **a video with no `ytPrivacy` is uploaded as
public**. `ytTags` is a list,
and tags past YouTube's 500-character total are dropped at upload.
`ytCategory` takes `people-blogs`, `science-tech`, `education`,
`entertainment`, `howto` or a numeric YouTube category id.

`create_post` fills a missing title from the first line of `text`, but
`validate_post` does not, so set `ytTitle` yourself and both tools agree. A
video must already be in your library (`list_media`), or reach it through
`upload_media` with a `url` (up to 100 MB).

### pinterest-pin.json

`boardId` is required, and `list_pinterest_boards` is the tool that returns it. If
more than one Pinterest account is connected, pass that tool the right
`accountId`. `text` becomes the pin description (up to 800 characters).
`title` is cut to 100 characters. `link` must start with `http://` or
`https://`. If you leave `title` or `link` out, `create_post` takes the first
line of `text` as the title and the first link in `text` as the link. A pin
carries one image or one video.

### facebook-reel.json

`fbType: "reel"` posts a video as a Reel. `fbType: "story"` would post a Story
instead, which takes exactly one photo or video and sends no caption. Without
`fbType`, the video is an ordinary Page post.

### linkedin-multi-image.json

A LinkedIn post takes up to 20 images or one video, never both. The name
`linkedin` in `platforms` posts to every connected LinkedIn account, member
profiles and Company Pages alike; to post as one Page only, use that Page's
account id, as linkedin-page-post.json does.

### linkedin-page-post.json

Each LinkedIn member profile and each Company Page you connect is its own
account in `list_accounts`. Putting an account `id` in `platforms` posts to
that account alone; the name `linkedin` would post to all of them. Options
are set per platform, so `options.linkedin` applies to every LinkedIn account
the post goes to. `firstComment` is posted after the post and can be up to
1,250 characters. A LinkedIn post takes up to 20 images or one video, never
both.

### tiktok-video.json

TikTok needs a video, or photos for a slideshow. `tiktokPrivacy` accepts
`public`, `followers`, `friends` or `private` (TikTok's own values such as
`SELF_ONLY` work too), and it must be an audience TikTok offers that account.
Any other word is refused.
**With no `tiktokPrivacy`, the post goes to the widest audience TikTok offers
the account, which is everyone for a public account.** Ask the user before
you leave it out. Comments, Duets and Stitches stay off unless their
`tiktokAllow…` option is `true`. Set `tiktokAiGenerated: true` to label a
video as AI-generated; photo posts cannot carry that label.

### tiktok-photos.json

Several images make a TikTok photo post, up to 20 here. TikTok takes JPEG or
WebP for photos, not PNG. `tiktokAutoAddMusic: true` asks TikTok to add
music, and works on photo posts only. The audience rule is the same as for a
video: set `tiktokPrivacy` rather than leaving it to the widest audience.

### per-platform-overrides.json

`text` goes to every platform without an override, here LinkedIn and
Facebook. `overrides` holds the wording for X, Bluesky and Threads, each
within that network's limit (280, 300 and 500 characters). The X wording has
no link, so the post also clears the X link rule on plans without it. An
override keyed by a platform name applies to every account on that platform.

### chat-channels-announcement.json

One text to four community channels. `linkCard: false` stops Discord from
unfurling the link; it does the same for a text-only Telegram message.
`mastodonVisibility` takes `public` (the default), `unlisted` or `private`;
`direct` is refused.
Mentions in a Discord post do not notify anyone.

## When the user wants it to go out

Keep the draft until the user confirms, in words, when it should publish.
Then either:

- create it with `"action": "schedule"`, `"scheduledDate": "2026-10-01"` and
  `"scheduledTime": "9:00 AM"`, or
- schedule the draft with `update_post`: send it back as `get_post` shows it,
  with `"action": "schedule"` and the same date and time. That runs the
  platform checks `create_post` runs. `reschedule_post` refuses a draft.

Times are read in the account owner's iHatePosting timezone (`ownerTimezone`
from `whoami`), and replies show them as `scheduledLocal` beside the UTC
`scheduledAt`. A date sent without `"action": "schedule"` is refused rather
than saved, so a draft never publishes on its own.
Use `"action": "now"` only when the user asks for the post to go out now.

## Sending an example over the REST API

The files work unchanged as request bodies. Use your own key in place of
`YOUR_API_KEY` (a key starts with `pk_live_` and is created under
Settings → Developers):

```bash
curl -X POST https://ihateposting.com/api/v1/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --data @examples/thread-x-bluesky.json
```

The REST API requires `action`; the `create_post` tool fills in `"draft"`
when it is missing.

To send every file in a folder as drafts, one request each, staying under 30
creates a minute:

```bash
for f in examples/*.json; do
  curl -s -X POST https://ihateposting.com/api/v1/posts \
    -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" \
    --data @"$f"
  sleep 2
done
```

Every file here is a draft, so nothing publishes. Replace every placeholder
first: they are not refused, and a media id that is not in your library is
dropped, so the draft would be saved without its file. Check each draft with
`get_post`. Before scheduling any of them, validate it: the validate route
takes a different body, as [Validate first, then create](#validate-first-then-create)
shows.
