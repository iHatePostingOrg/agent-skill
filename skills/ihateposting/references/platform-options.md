# Per-network options

Load this when a post needs more than text: a title, a board, a privacy level, a thread, a first comment, a cover image or a Reel. `get_platform_rules` lists only the options a network cannot publish without. This file lists the keys the publisher reads that a post is likely to need, with their values and defaults.

## How options are sent

| Tool | Where options go |
|---|---|
| `create_post` | `options: { "<network>": { key: value } }`, plus `overrides: { "<network>": "different text" }` |
| `update_post` | The same `options` and `overrides` shape, but the post itself takes `baseContent`, `accountIds` (not platform names) and a required `action`. It replaces the whole post, so read the post with `get_post` first and send every option back. |
| `validate_post` | Inside each target: `targets: [{ "platform": "youtube", "contentOverride": "…", "options": { … } }]` |

Rules that apply to every network:

- **Options belong to a network, not an account.** Every account of that network in the post gets the same options. To give two Pinterest accounts different boards, create two posts.
- **Keys are not checked when you send them.** A misspelled key is saved and then ignored. Copy the spellings below exactly.
- **Some fields fill themselves.** When you leave them unset, `create_post` and `update_post` fill YouTube `ytTitle` (first line of the text, without links, hashtags or @handles) and `ytTags` (its hashtags), Pinterest `title` (first line) and `link` (first URL), and Tumblr `tumblrTags` (hashtags). A value you send always wins, including an empty string `""`.
- **`validate_post` does not fill those fields.** Pass `ytTitle` yourself when validating a YouTube post, or it reports a missing title that `create_post` would have filled.
- **When the checks run.** With action `schedule` or `now`, `create_post` and `update_post` run each network's checks and refuse the post with the first blocking problem. Drafts skip these checks, but the X link rule below applies to drafts too. `reschedule_post` does not run them when it turns a draft into a scheduled post. The publisher checks again just before sending and skips a send that fails.
- **Check what was saved.** `get_post` returns each network's stored options, including the filled-in ones, and a `notice` when a send worked but part of it did not (for example, a refused YouTube thumbnail).

Example (a draft; nothing is published):

```json
{
  "text": "How we plan a week of posts in 20 minutes #planning",
  "platforms": ["youtube", "pinterest", "x"],
  "action": "draft",
  "mediaIds": ["YOUR_VIDEO_MEDIA_ID"],
  "options": {
    "youtube": { "ytMadeForKids": false, "ytPrivacy": "unlisted" },
    "pinterest": { "boardId": "BOARD_ID_FROM_list_pinterest_boards" }
  },
  "overrides": { "x": "A week of posts in 20 minutes. Here is how." }
}
```

## Options on several networks

| Key | Networks | Value | What it does |
|---|---|---|---|
| `threadSegments` | x, bluesky, threads, mastodon | array of strings | Two or more non-empty strings post as a chained thread. The segments replace the post text, so put the opening post in segment 1. Media goes on the first part. Each part is checked against the character limit. If a later part fails, the first parts stay live and the send is not retried automatically. |
| `firstComment` | instagram, linkedin, threads | string | Posted as a comment right after the post goes live. A comment that fails does not fail the post. The older key `igFirstComment` is also read. |
| `coverAssetId` | youtube, telegram, instagram, pinterest, facebook, linkedin, mastodon, tumblr | media id of an image in the library | Cover image for a video. An id that is not one of the user's images is ignored. TikTok does not take an uploaded cover; use `coverOffsetMs`. |
| `mediaExcluded` | all | array of positions (0-based) in `mediaIds` | Leaves those attachments out for this network only. After that, only the first images up to the network's limit are sent. |
| `linkCard` | bluesky, telegram, discord | `false` | Turns off the link preview. Leave it unset to keep the preview. |

Alt text is not an option: set it on the media with `upload_media` (`altText`). Bluesky, Threads (a single image), Mastodon, Tumblr, Slack, Instagram (images) and Pinterest (image pins) publish it. LinkedIn uses it as the title of a video.

## X

| Key | Values | Default | Notes |
|---|---|---|---|
| `threadSegments` | array of strings | none | See the shared table. Each part has X's 280 weighted-character limit. |
| `xReplySettings` | `following`, `mentioned`, `subscribers`, `verified` | everyone | Any other value means everyone. Applies to the first post of a thread. |
| `xCommunity` | community URL or numeric id | none | The account must be a member of the community. |
| `xMadeWithAi` | `true` | off | Labels the post as made with AI. |
| `xPaidPartnership` | `true` | off | Labels the post as a paid partnership. |
| `xPostType` | `"article"` | normal post | Posts an X Article. The post text becomes the article body, and media is not attached. X accepts Articles only from Premium accounts. |
| `xArticleTitle` | string | none | Required when `xPostType` is `"article"`. |
| `xArticleStatus` | `"publish"` | saved as an X draft | Without `"publish"`, the article stays in the account's X drafts and the send still shows as published, with no link. |
| `autoPlug`, `plugText`, `plugThreshold`, `autoRepost` | `true`, string, number, `true` | threshold 50 | Pro plan only; on any other plan these keys are removed without an error. For 24 hours after publishing, once the post reaches `plugThreshold` likes, `autoPlug` replies with `plugText` and `autoRepost` reposts it (at least 6 hours after publishing). |

Traps:
- Links in X text, thread parts included, are refused unless the user is on a paid Pro plan (the trial does not count). Send an X `overrides` entry without the link.
- One video or up to 4 images per post, not both.

## Bluesky

| Key | Values | Default | Notes |
|---|---|---|---|
| `threadSegments` | array of strings | none | 300 characters per part. |
| `linkCard` | `false` | card on | Without media, a card is built from the first URL in the first part. |
| `lang` | one language code, e.g. `en`, `pt-BR` | none | An invalid code is ignored. Applies to every part. |
| `label` | `suggestive`, `nudity`, `graphic` | none | Content warning. Any other value adds no label. Applies to every part. |

Traps: up to 4 images or one video, not both.

## Threads

| Key | Values | Default | Notes |
|---|---|---|---|
| `threadSegments` | array of strings | none | 500 characters per part. |
| `firstComment` | string | none | Posted under the last part of a thread. |
| `threadsReplyControl` | `everyone`, `following`, `mentioned`, `followers`, `author` | everyone | Meta's own names (`accounts_you_follow`, `mentioned_only`, `followers_only`, `parent_post_author_only`) also work. Set on the first post only. |

Traps:
- Thread parts, first comments and a reply limit all need Threads' reply permission. On a Threads account connected before 4 September 2026, a thread or a reply limit can fail with a message asking for a reconnect, and a first comment is skipped. Reconnecting fixes both.
- Up to 20 images and videos in one carousel.

## Mastodon

| Key | Values | Default | Notes |
|---|---|---|---|
| `threadSegments` | array of strings | none | 500 characters per part. |
| `mastodonVisibility` | `public`, `unlisted`, `private` | `public` | `direct` is not accepted and posts as `public`. |
| `coverAssetId` | image media id | none | Video thumbnail. |

## Telegram

| Key | Values | Default | Notes |
|---|---|---|---|
| `linkCard` | `false` | preview on | Text-only messages. |
| `coverAssetId` | image media id | none | Video cover. |

Traps: no threads. A caption with media is capped at 1,024 characters; text alone at 4,096.

## Discord

| Key | Values | Default | Notes |
|---|---|---|---|
| `linkCard` | `false` | embeds on | Stops Discord unfurling links. |

Mentions in the text never ping anyone.

## Slack

No options. Up to 5 images per message.

## Tumblr

| Key | Values | Default | Notes |
|---|---|---|---|
| `tumblrTitle` | string | none | Shown as a heading above the text. Never filled automatically. |
| `tumblrTags` | array, or one comma-separated string | the text's hashtags | A leading `#` is removed. Up to 30 tags. |
| `tumblrLink` | URL | none | Adds a link card after the post. `https://` is added when missing; a value that is not a URL is dropped. |
| `tumblrSourceUrl` | URL | none | The post's source link. |
| `coverAssetId` | image media id | none | Video poster. |

## Facebook (Pages)

| Key | Values | Default | Notes |
|---|---|---|---|
| `fbType` | `reel`, `story` | feed post | `reel` applies to a video. `story` needs exactly one photo or video, and no caption is sent. |
| `fbLink` | URL | none | Adds a link preview. Text-only posts only; ignored when media is attached. |
| `fbBackground` | a Facebook background preset id (numeric string) | none | Text-only posts with no `fbLink`. An id the app does not know is ignored, and no tool lists them, so use one only if the user supplies it. |
| `coverAssetId` | image media id | none | Video thumbnail. |

Traps: up to 10 photos or one video, not both. Story photos are capped at 10 MB.

## Instagram

| Key | Values | Default | Notes |
|---|---|---|---|
| `igType` | `feed`, `reel`, `story` | `feed` | `feed`: one image is a photo post, one video is a Reel that also shows on the profile grid, 2 to 10 items make a carousel. `reel`: a single video stays off the grid, in the Reels tab only. `story`: exactly one image or video, no caption. |
| `firstComment` | string | none | Not posted on stories. |
| `igUserTags` | array of usernames, or one comma-separated string | none | Up to 20. Instagram lets only business and creator accounts be tagged. When you schedule or publish, a handle Instagram says it cannot tag gets the post refused, with the handle named. The same tags go on every carousel item. Ignored on stories. |
| `igCollaborators` | array of usernames, or one comma-separated string | none | Up to 3. Refused on stories. |
| `igTrialReel` | `true` | off | Posts a single-video Reel as a trial reel. |
| `igGraduation` | `manual`, `auto` | `manual` | For a trial reel. `auto` lets Instagram share it with followers if it performs; `manual` leaves that to the creator in the Instagram app. |
| `coverAssetId` | image media id | none | Cover for a single-video Reel. |
| `coverOffsetMs` | number (milliseconds) | none | Frame to use as the Reel cover. Used only when `coverAssetId` is unset. |

Traps: media is required. At most 30 hashtags in a caption.

## LinkedIn

| Key | Values | Default | Notes |
|---|---|---|---|
| `firstComment` | string, up to 1,250 characters | none | A longer comment is refused, not cut. |
| `coverAssetId` | image media id | none | Video thumbnail. |

Traps: a video cannot be combined with photos. Up to 20 images.

## Pinterest

| Key | Values | Default | Notes |
|---|---|---|---|
| `boardId` | board id from `list_pinterest_boards` | **required** | The board must belong to the Pinterest account you post to; pass `accountId` to `list_pinterest_boards` when several are connected. |
| `title` | string, up to 100 characters | first line of the text | |
| `link` | URL starting with `http://` or `https://`, up to 2,048 characters | first URL in the text | Send `""` for a pin with no link. |
| `coverAssetId` | image media id | first frame | Cover for a video pin. |

Traps: media is required, one image or one video per pin; when both are attached, the video is used. The text is the pin description, up to 800 characters.

## TikTok

| Key | Values | Default | Notes |
|---|---|---|---|
| `tiktokPrivacy` | `public`, `followers`, `friends`, `private` (also `everyone`, `mutual`, `self`), or TikTok's `PUBLIC_TO_EVERYONE`, `FOLLOWER_OF_CREATOR`, `MUTUAL_FOLLOW_FRIENDS`, `SELF_ONLY` | **the widest audience TikTok allows the account** | Unset means public for a public account and followers for a private one. An unrecognised word means only the creator can see it. Ask the user rather than leaving it unset. |
| `tiktokAllowComment` | `true` | off | |
| `tiktokAllowDuet` | `true` | off | Videos only. |
| `tiktokAllowStitch` | `true` | off | Videos only. |
| `tiktokAiGenerated` | `true` | off | Labels AI-generated content. Videos only. |
| `tiktokYourBrand` | `true` | off | Discloses promotion of the creator's own business. |
| `tiktokCommercial` | `true` | off | Discloses branded content. TikTok refuses branded content set to private. |
| `tiktokAutoAddMusic` | `true` | off | Photo posts only. |
| `tiktokSendAsDraft` | `true` | off | Sends the post to the creator's TikTok inbox to finish in the app. **Nothing is published**, but the send still shows as sent, with no link. |
| `coverOffsetMs` | number (milliseconds) | TikTok's choice | Video frame to use as the cover. |

Traps: media is required: one video, or photos (TikTok takes up to 35, but a post here carries at most 20 media ids), never both. On a photo post the title is the text cut to 90 characters, and the full text goes in the description.

## YouTube

| Key | Values | Default | Notes |
|---|---|---|---|
| `ytTitle` | string, up to 100 characters | first line of the text | **Required.** The key is `ytTitle`; `title` is ignored for YouTube. |
| `ytMadeForKids` | `true` / `false`, or `"yes"` / `"no"` | none | **Required**, and never filled automatically. Ask the user. |
| `ytPrivacy` | `public`, `unlisted`, `private` | `public` | The key is `ytPrivacy`; `privacy` is ignored. |
| `ytTags` | array, or one comma-separated string | the text's hashtags (up to 15) | A leading `#` is removed. Up to 30 tags, trimmed to fit YouTube's 500-character total. |
| `ytCategory` | `people-blogs`, `science-tech`, `education`, `entertainment`, `howto`, or a numeric YouTube category id | none sent | Any other value is ignored. |
| `ytPlaylistId` | YouTube playlist id | none | No tool lists playlists; use one the user gives you. The video is added after upload. If that fails, the video stays published and the post does not say so. |
| `coverAssetId` | image media id | YouTube's frame | Custom thumbnail. YouTube accepts it only from phone-verified channels. A refusal leaves the video published and adds a `notice` to the post. |

Traps: exactly one video. The text is the description, capped at 5,000 bytes, so accented letters and emoji use up the limit faster.

Google Business Profile is coming soon and does not accept posts yet.
