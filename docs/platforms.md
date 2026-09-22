# Networks

iHatePosting publishes to 14 networks: Bluesky, X, LinkedIn, Facebook, Threads, Mastodon, Telegram, Discord, Tumblr, Slack, Instagram, Pinterest, TikTok and YouTube.

This page lists what each one accepts: post types, text limits, media, the options you must set, and the optional ones worth knowing. The limits here come from iHatePosting's own checks and publishing code. For the live numbers, call `get_platform_rules`. To check one specific post, call `validate_post`.

## How options are passed

`create_post` takes an `options` object keyed by network name, and an `overrides` object for different text on one network:

```json
{
  "text": "New episode is out: how we cut our build time in half.",
  "platforms": ["pinterest", "youtube", "x"],
  "action": "draft",
  "mediaIds": ["YOUR_MEDIA_ID"],
  "options": {
    "pinterest": { "boardId": "YOUR_BOARD_ID" },
    "youtube": { "ytTitle": "How we cut our build time in half", "ytMadeForKids": false }
  },
  "overrides": { "x": "New episode: how we cut our build time in half." }
}
```

Option keys are case-sensitive. The REST API accepts keys up to 60 characters.

What happens when a check fails:

- A draft is saved even if a network would refuse it. The exception is the X link rule (see X below), which applies to drafts too.
- A post created with `schedule` or `now` is refused straight away, with the first blocking reason.
- `reschedule_post` turns a draft into a scheduled post without that create-time check. The send-time check below still runs.
- iHatePosting checks every network again just before it sends. A send that fails that check is marked `skipped` and never reaches the network.

### Options that work on more than one network

| Key | Networks | What it does |
|---|---|---|
| `threadSegments` | Bluesky, X, Threads, Mastodon | An array of two or more strings, posted as a reply chain. The array replaces the post text, so the first item is the opening post. Media goes on the first post. If the chain breaks midway, the posts already out stay up and the send is not retried automatically. |
| `firstComment` | Instagram, LinkedIn, Threads | Text posted as a comment once the post is live. See each network for its limits. |
| `coverAssetId` | YouTube, Instagram, Facebook, LinkedIn, Pinterest, Mastodon, Telegram, Tumblr | The id of an image in your media library, used as the video's cover or thumbnail. |
| `mediaExcluded` | All | An array of positions in `mediaIds`, counting from 0, to leave off this network. |
| `linkCard` | Bluesky, Telegram, Discord | `false` turns off the link preview. |

### Media

- The media library takes JPEG, PNG, WebP and GIF images, and MP4, MOV and WebM videos.
- Library uploads are capped at 25 MB per image and 2,000 MB per video. Every file also counts toward your plan's storage, which is 500 MB on the free plan and during the 90-day free trial.
- A post can attach at most 20 media items, whatever the network allows.
- Codec and frame-rate rules apply once iHatePosting has measured the file after upload. Until then those checks are skipped.
- The MCP `upload_media` tool takes files up to 8 MB. Upload larger files in the iHatePosting app, then find them with `list_media`.
- Alt text belongs to the media item, not the post. The networks that publish it are listed below.
- If you attach more images than a network takes, that network gets the first ones up to its limit.

## Bluesky (`bluesky`)

- **Post types:** post, or a thread through `threadSegments`.
- **Text:** 300 characters per post. iHatePosting counts Unicode code points, so some emoji count as more than one.
- **Media:** up to 4 images, or 1 video, but not both. Images over Bluesky's 2 MB limit are compressed before upload instead of being refused. Video: MP4, up to 10 minutes and 300,000,000 bytes.
- **Required:** nothing.
- **Options:**
  - `label`: `suggestive`, `nudity` or `graphic`. Sets a Bluesky content label on every post in the thread.
  - `lang`: a language code such as `en`.
  - `linkCard`: `false` stops the link preview. Without it, the first link in the opening post gets a preview card when there is no media. YouTube links never get one.
- **First comment:** no. **Alt text:** yes, for images and video. **Analytics:** collected.

## X (`x`)

- **Post types:** post, or a thread through `threadSegments`. A post can go to an X Community.
- **Text:** 280, counted the way X counts. Every link costs 23, and most emoji and CJK characters cost 2.
- **Media:** up to 4 images, or 1 video, but not both. Images: JPEG, PNG, GIF or WebP, up to 5 MB (GIFs up to 15 MB). Video: MP4 or MOV, 0.5 seconds to 20 minutes, 60 fps or less.
- **Required:** nothing.
- **Options** (these apply to the first post of a thread):
  - `xReplySettings`: `following`, `mentioned`, `subscribers` or `verified`. Leave it out to let everyone reply.
  - `xCommunity`: a Community id, or its `x.com/i/communities/…` link. The account has to be a member.
  - `xMadeWithAi`: `true` marks the post as made with AI.
  - `xPaidPartnership`: `true` marks it as a paid partnership.
- **Account limits:** X posts count against a monthly allowance set by your plan. A post whose X text has a link (`http://`, `https://` or `www.`) is refused, even as a draft, unless you pay for the iHatePosting Pro plan. The free trial doesn't count.
- **First comment:** no. **Alt text:** not sent. **Analytics:** X charges for every read. Collection runs only when the server's X metrics setting is on. Otherwise X shows as not measured.

## LinkedIn (`linkedin`)

- **Accounts:** a personal profile or a Company Page.
- **Post types:** text, a single image, a multi-image post (up to 20), or a video.
- **Text:** 3,000 characters.
- **Media:** up to 20 images, or 1 video. Photos and a video can't share a post. Video: MP4 or MOV, 3 seconds to 30 minutes.
- **Required:** nothing.
- **Options:**
  - `firstComment`: up to 1,250 characters. A longer comment is refused, not cut.
  - `coverAssetId`: the video thumbnail.
- **First comment:** yes. **Alt text:** used as the video's title (first 100 characters), not sent for images. **Analytics:** Company Pages only. Personal profiles are never measured.

## Facebook (`facebook`)

- **Accounts:** Facebook Pages.
- **Post types:** text, a photo, a multi-photo post (up to 10), a video, a Reel, or a Story.
- **Text:** 63,000 characters.
- **Media:** up to 10 images, or 1 video, but not both. Photos up to 10 MB. Feed video: MP4 or MOV, 1 second to 240 minutes. Reel: 3 to 90 seconds, 24 to 60 fps, vertical. Story: exactly one photo or one video, and a Story video runs 3 to 90 seconds.
- **Required:** nothing.
- **Options:**
  - `fbType`: `reel` or `story`. Leave it out for a feed post. A Story carries no caption.
  - `fbLink`: a URL shown as a link preview. Text-only posts only.
  - `coverAssetId`: the video thumbnail.
- **First comment:** no. **Alt text:** not sent. **Analytics:** collected.

## Threads (`threads`)

- **Post types:** post, a thread through `threadSegments`, or a carousel.
- **Text:** 500 characters per post.
- **Media:** up to 20 items, images and videos mixed. Video: MP4 or MOV, H.264 or HEVC, 23 to 60 fps, up to 5 minutes. Images over 8 MB get a warning, not a refusal.
- **Required:** nothing.
- **Options:**
  - `threadsReplyControl`: `everyone`, `following`, `mentioned`, `followers` or `author`. Sets who can reply to the first post.
  - `firstComment`: posted as a reply to the last post in the chain.
- **First comment:** yes. **Alt text:** single-image posts only. **Analytics:** collected.

## Mastodon (`mastodon`)

- **Accounts:** any instance.
- **Post types:** post, or a thread through `threadSegments`.
- **Text:** 500 characters per post, for every instance.
- **Media:** up to 4 images, or 1 video, but not both. Images up to 16 MB and 33,177,600 pixels (GIFs up to 921,600 pixels). Video: MP4, MOV, WebM or Ogg, up to 99 MB.
- **Required:** nothing.
- **Options:**
  - `mastodonVisibility`: `public` (the default), `unlisted` or `private`.
  - `coverAssetId`: the video thumbnail.
- **First comment:** no. **Alt text:** yes, cut to 1,500 characters. **Analytics:** collected.

## Telegram (`telegram`)

- **Accounts:** a Telegram channel, posted to by the iHatePosting bot.
- **Post types:** a text message, a photo, a video, or an album of 2 to 10 photos and videos.
- **Text:** 4,096 characters, or 1,024 when media is attached.
- **Media:** up to 10 items, with at most 1 video. Photos up to 5 MB, width plus height at most 10,000 pixels, and a ratio of at most 20:1. Video: MP4, up to 50 MB alone or 20 MB inside an album.
- **Required:** nothing.
- **Options:**
  - `linkCard`: `false` turns off the link preview.
  - `coverAssetId`: the video thumbnail.
- **First comment:** no. **Alt text:** not sent. **Analytics:** no per-post numbers. The member count is tracked.

## Discord (`discord`)

- **Accounts:** a channel, connected with the iHatePosting bot or a webhook.
- **Post types:** a channel message, with attachments.
- **Text:** 2,000 characters.
- **Media:** up to 10 attachments, images and videos mixed, up to 10 MB each.
- **Required:** nothing.
- **Options:**
  - `linkCard`: `false` turns off link embeds.
- **First comment:** no. **Alt text:** not sent. **Analytics:** reactions and thread replies for channels connected with the bot. Webhook connections can't be read back, and Discord has no view count.

## Tumblr (`tumblr`)

- **Post types:** a post with text, images, one video and a link card.
- **Text:** 4,096 characters.
- **Media:** up to 30 images and 1 video (but no more than 20 items per post, see Media above). Images: JPEG, PNG, WebP or GIF, up to 20 MB (GIFs up to 10 MB). Video: MP4 or MOV, up to 10 minutes and 500 MB.
- **Required:** nothing.
- **Options:**
  - `tumblrTitle`: a heading above the post.
  - `tumblrTags`: a comma-separated string or an array, up to 30 tags. A leading `#` is removed. If you leave it out, `create_post` fills it from the hashtags in the text.
  - `tumblrLink`: a URL added as a link card at the end of the post.
  - `tumblrSourceUrl`: the post's source link.
  - `coverAssetId`: the video poster.
- **First comment:** no. **Alt text:** yes, for images. **Analytics:** collected.

## Slack (`slack`)

- **Accounts:** a workspace channel. For a private channel, invite the iHatePosting app first.
- **Post types:** a channel message.
- **Text:** 3,000 characters.
- **Media:** up to 5 images and 1 video. Video: MP4 or MOV, up to 1 GB.
- **Required:** nothing.
- **First comment:** no. **Alt text:** yes, on messages with images and no video. **Analytics:** reactions and replies. Slack counts no views, and workspaces connected before 23 August need to reconnect once before reactions appear.

## Instagram (`instagram`)

- **Accounts:** Business or Creator accounts.
- **Post types:** an image post, a carousel (2 to 10 images and videos), a Reel (any single video), or a Story.
- **Text:** 2,200 characters and at most 30 hashtags. Stories carry no caption.
- **Media:** required, up to 10 items. Images up to 8 MB. An image outside 4:5 to 1.91:1 gets a warning that Instagram will crop it. Reel: MP4 or MOV, H.264 or HEVC, 23 to 60 fps, 3 seconds to 15 minutes, up to 300 MB. A Story is one image or one video, and a Story video runs 3 to 60 seconds and up to 100 MB.
- **Required:** at least one image or video.
- **Options:**
  - `igType`: `feed` (the default), `reel` or `story`. For a single video, `feed` also shows the Reel on the profile grid, and `reel` keeps it in the Reels tab only.
  - `firstComment`: posted once the post is live. Not for Stories.
  - `igUserTags`: up to 20 usernames to tag. Instagram can only tag Business and Creator accounts. Not for Stories.
  - `igCollaborators`: up to 3 usernames to invite as collaborators. Not for Stories.
  - `igTrialReel`: `true` posts a single-video Reel as a trial. With `igGraduation: "auto"`, Instagram decides whether to share it with followers. Otherwise you do that yourself in the Instagram app.
  - `coverAssetId`: the Reel cover.
- **First comment:** yes. **Alt text:** yes, for images (cut to 1,000 characters). **Analytics:** collected.

## Pinterest (`pinterest`)

- **Post types:** an image pin or a video pin.
- **Text:** a description of up to 800 characters.
- **Media:** required. One image or one video. If both are attached, the video is used. Video: MP4, MOV or M4V, H.264 or HEVC, up to 15 minutes.
- **Required:** `boardId`. Get it from `list_pinterest_boards`. Pinterest refuses a pin without a board.
- **Options:**
  - `title`: up to 100 characters. If you leave it out, `create_post` fills it from the first line of the text.
  - `link`: the destination URL. It must start with `http://` or `https://` and can be up to 2,048 characters. If you leave it out, `create_post` fills it with the first link in the text.
  - `coverAssetId`: the video cover. Without one, Pinterest uses the first frame.
- **First comment:** no. **Alt text:** yes, for image pins (cut to 500 characters). **Analytics:** collected.

## TikTok (`tiktok`)

- **Post types:** a video, or a photo slideshow.
- **Text:** 2,200 characters.
- **Media:** required. One video, or up to 35 photos (no more than 20 per post here, see Media above), but not both. Photos: JPEG or WebP (not PNG), up to 20 MB each, with the shorter side at most 1,080 pixels. Video: MP4, MOV or WebM, H.264, HEVC, VP8 or VP9, 23 to 60 fps, up to 10 minutes.
- **Required:** nothing beyond the media. Set `tiktokPrivacy` anyway (see below).
- **Options:**
  - `tiktokPrivacy`: `public`, `followers`, `friends` or `private`. TikTok's own values (`PUBLIC_TO_EVERYONE`, `FOLLOWER_OF_CREATOR`, `MUTUAL_FOLLOW_FRIENDS`, `SELF_ONLY`) work too. **If you leave it out, the post goes to the widest audience TikTok offers the account, which is public for a public account.** Any other lowercase word is treated as `private`.
  - `tiktokAllowComment`, `tiktokAllowDuet`, `tiktokAllowStitch`: `true` to allow each one. All are off unless you turn them on.
  - `tiktokAiGenerated`: `true` labels a video as AI-generated. TikTok has no such label for slideshows.
  - `tiktokYourBrand`: `true` discloses that you are promoting your own brand.
  - `tiktokCommercial`: `true` discloses branded content. TikTok refuses branded content posted as private.
  - `tiktokAutoAddMusic`: `true` lets TikTok add music to a slideshow.
  - `tiktokSendAsDraft`: `true` sends the post to the creator's TikTok inbox to finish in the app. iHatePosting marks the send as done without a link, because nothing is public until the creator publishes it.
  - `coverOffsetMs`: the frame, in milliseconds, that TikTok uses as the video cover. TikTok takes no uploaded cover image.
- **First comment:** no. **Alt text:** not sent. **Analytics:** views, likes, comments and shares for public posts. An account connected before analytics access has to reconnect once.

## YouTube (`youtube`)

- **Post types:** one video upload. YouTube decides whether it becomes a Short. A vertical or square video of 3 minutes or less becomes one.
- **Text:** a description of up to 5,000 bytes. `<` and `>` count as 4 each, and accented, non-Latin and emoji characters count as 2 to 4.
- **Media:** exactly one video, 1 second to 12 hours. No images.
- **Required:**
  - `ytTitle`: up to 100 characters. If you leave it out, `create_post` fills it from the first line of the text. `validate_post` doesn't fill it, so `validate_post` may report a missing title that `create_post` would supply.
  - `ytMadeForKids`: `true` or `false` (`"yes"` and `"no"` work too). This is YouTube's made-for-kids declaration, and there is no default.
- **Options:**
  - `ytPrivacy`: `public` (the default), `unlisted` or `private`.
  - `ytTags`: a comma-separated string or an array. YouTube takes up to 30 tags within a 500-character budget, and extra tags are dropped. If you leave it out, `create_post` fills it from the hashtags in the text.
  - `ytCategory`: `people-blogs`, `science-tech`, `education`, `entertainment`, `howto`, or a numeric YouTube category id as a string, such as `"28"`.
  - `ytPlaylistId`: adds the video to a playlist after upload. This works only when the channel was connected with playlist permission. Otherwise the video still publishes, just outside the playlist.
  - `coverAssetId`: a custom thumbnail, JPG or PNG, up to 50 MB. YouTube sets it only on a phone-verified channel. Otherwise the video still publishes with YouTube's own frame.
- **First comment:** no. **Alt text:** not sent. **Analytics:** collected.
