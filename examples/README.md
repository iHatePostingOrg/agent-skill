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
| `IMAGE_ID_FROM_list_media`, `VIDEO_ID_FROM_list_media` | `list_media` (files already in your library), or `upload_media` for a new file of 8 MB or less |
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
| [thread-x-bluesky.json](thread-x-bluesky.json) | A four-part thread on X and on Bluesky. |
| [instagram-reel-first-comment.json](instagram-reel-first-comment.json) | An Instagram Reel whose hashtags go in the first comment. |
| [instagram-carousel.json](instagram-carousel.json) | Five images as a carousel on Instagram and Threads, and as a four-image post on Bluesky. |
| [youtube-upload.json](youtube-upload.json) | A private YouTube upload with its title, audience declaration, tags and category. |
| [pinterest-pin.json](pinterest-pin.json) | A pin on a chosen board, with a title and a link. |
| [linkedin-page-post.json](linkedin-page-post.json) | An image post to one LinkedIn account (a Company Page), with a first comment. |
| [tiktok-video.json](tiktok-video.json) | A TikTok video with its audience and interaction settings. |
| [per-platform-overrides.json](per-platform-overrides.json) | One announcement, with shorter wording for X, Bluesky and Threads. |
| [chat-channels-announcement.json](chat-channels-announcement.json) | One message to Telegram, Discord, Slack and Mastodon. |

### thread-x-bluesky.json

`options.<platform>.threadSegments` turns a post into a thread: the first
segment is the post, and each later one replies to the one before it. With
two or more segments, the segments are what gets posted on that platform, not
`text`, so repeat the opening in `text`. X counts each segment against 280
characters, Bluesky against 300. Threads and Mastodon read `threadSegments`
too. `lang` sets the language tag on the Bluesky posts.

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
video must already be in your library (`list_media`), or be 8 MB or less to go
through `upload_media`.

### pinterest-pin.json

`boardId` is required, and `list_pinterest_boards` is the tool that returns it. If
more than one Pinterest account is connected, pass that tool the right
`accountId`. `text` becomes the pin description (up to 800 characters).
`title` is cut to 100 characters. `link` must start with `http://` or
`https://`. If you leave `title` or `link` out, `create_post` takes the first
line of `text` as the title and the first link in `text` as the link. A pin
carries one image or one video.

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
**With no `tiktokPrivacy`, the post goes to the widest audience TikTok offers
the account, which is everyone for a public account.** Ask the user before
you leave it out. Comments, Duets and Stitches stay off unless their
`tiktokAllow…` option is `true`. Set `tiktokAiGenerated: true` to label a
video as AI-generated; photo posts cannot carry that label.

### per-platform-overrides.json

`text` goes to every platform without an override, here LinkedIn and
Facebook. `overrides` holds the wording for X, Bluesky and Threads, each
within that network's limit (280, 300 and 500 characters). The X wording has
no link, so the post also clears the X link rule on plans without it. An
override keyed by a platform name applies to every account on that platform.

### chat-channels-announcement.json

One text to four community channels. `linkCard: false` stops Discord from
unfurling the link; it does the same for a text-only Telegram message.
`mastodonVisibility` takes `public` (the default), `unlisted` or `private`.
Mentions in a Discord post do not notify anyone.

## When the user wants it to go out

Keep the draft until the user confirms, in words, when it should publish.
Then either:

- create it with `"action": "schedule"`, `"scheduledDate": "2026-10-01"` and
  `"scheduledTime": "9:00 AM"`, or
- call `reschedule_post` with the draft's id and the same date and time.

Times are read in the account owner's iHatePosting timezone. `scheduledDate`
and `scheduledTime` have no effect on a draft, so a draft never publishes on
its own. `reschedule_post` turns a draft into a scheduled post without
running the platform checks that `create_post` runs, so call `validate_post`
first.
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
