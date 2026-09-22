# iHatePosting REST API (v1)

The plugin in this repository talks to iHatePosting through its hosted MCP server. That server calls the REST API described here, using the key you give it. You can call the same API yourself from a script, a CI job or an automation tool.

- Base URL: `https://ihateposting.com`
- Every request and response body is JSON, except the analytics spreadsheet export.
- The API, the MCP server and webhooks are included on every plan.

## Contents

- [Authentication](#authentication)
- [Conventions](#conventions)
- [Rate limits](#rate-limits)
- [Endpoints](#endpoints)
- [Accounts and platform rules](#accounts-and-platform-rules)
- [Posts](#posts)
- [Pinterest boards](#pinterest-boards)
- [Media and uploads](#media-and-uploads)
- [Analytics](#analytics)
- [Webhooks](#webhooks)
- [What the API does not do](#what-the-api-does-not-do)

## Authentication

1. In iHatePosting, open **Settings → Developers** and create an API key.
2. Copy it straight away. The full key is shown once. iHatePosting stores only a hash of it.
3. Send it on every request:

```
Authorization: Bearer pk_live_…
```

A key looks like `pk_live_` followed by 48 hex characters. You have one active key at a time: creating a new key revokes the old one, so update every integration that used it.

Each key belongs to one iHatePosting login. Every read and write is scoped to that login's own posts, accounts and media. An id that belongs to someone else behaves as if it does not exist.

A missing, malformed, revoked or unknown key gets `401` with an `error` sentence.

## Conventions

**Errors.** A failed request returns an HTTP error status and a body like `{ "error": "That time is in the past — pick a future slot." }`. Most of these sentences are written to be shown to a person as is; a few are short, such as `"not found"` or `"invalid request"`.

**Dates and times.** Scheduling takes a wall-clock date and time, not a timestamp:

- `scheduledDate`: `YYYY-MM-DD`
- `scheduledTime`: `9:00 AM`, `12:30 PM` or 24-hour `17:00`

Both are read in the timezone set in **Settings → Scheduling**. A time more than a minute in the past is refused with `400`. Responses give `scheduledAt` as a UTC ISO timestamp.

**Post statuses:** `draft`, `scheduled`, `publishing`, `published`, `partial` (some platforms published, some did not), `failed`.

**Send statuses.** A post has one *target* (a send) per destination account. A target is `pending`, `publishing`, `published`, `failed` or `skipped`.

**Account statuses:** `active` or `needs_reauth`. An account that needs reconnecting is listed, but posts cannot be sent to it until you reconnect it on the Accounts page.

**Platform names:** `bluesky`, `x`, `linkedin`, `facebook`, `threads`, `mastodon`, `telegram`, `discord`, `tumblr`, `slack`, `instagram`, `pinterest`, `tiktok`, `youtube`.

## Rate limits

Limits count requests per iHatePosting login, not per key, in fixed 60-second windows. Going over returns `429` with an `error` sentence. Wait for the window to pass, then try again.

| Limit per minute | Applies to |
|---|---|
| 60, shared | `GET /api/v1/accounts`, `GET /api/v1/platforms` and `GET /api/v1/posts` together |
| 30 | `POST /api/v1/posts` |
| 60 | `POST /api/v1/posts/validate` |
| 600 | `GET /api/v1/posts/{id}` |
| 60 | `PATCH /api/v1/posts/{id}`, shared with saves you make in the iHatePosting app |
| 600 | `DELETE /api/v1/posts/{id}` |
| 30 | `POST /api/v1/posts/{id}/reschedule` |
| 15 | `POST /api/v1/posts/{id}/retry` |
| 60 | `GET /api/v1/pinterest/boards` |
| 120 | `GET /api/v1/media` |
| 30, shared | `POST /api/v1/media/presign` and `POST /api/media/multipart/create` together |
| 60 | `POST /api/v1/media/confirm` |
| 600 | `POST /api/media/multipart/parts`, `/complete` and `/abort` together |
| 60 | `GET /api/v1/analytics` |

## Endpoints

Every route below takes `Authorization: Bearer pk_live_…`. The last column names the MCP tool that calls the route, for when you are reading an agent's tool calls.

| Method | Path | What it does | MCP tool |
|---|---|---|---|
| GET | `/api/v1/accounts` | Your connected accounts, with their ids | `whoami`, `list_accounts` |
| GET | `/api/v1/platforms` | What each platform accepts, and which options it requires | `get_platform_rules` |
| POST | `/api/v1/posts/validate` | Checks a post against each platform's rules without creating anything | `validate_post` |
| POST | `/api/v1/posts` | Creates a post as a draft, scheduled for later, or sent now | `create_post` |
| GET | `/api/v1/posts` | Your 50 most recently created posts, with each send's status | `list_posts` |
| GET | `/api/v1/posts/{id}` | One post in full: text, options, media, sends | `get_post` |
| PATCH | `/api/v1/posts/{id}` | Replaces a draft, scheduled or failed post | `update_post` |
| DELETE | `/api/v1/posts/{id}` | Removes a post from iHatePosting | `delete_post` |
| POST | `/api/v1/posts/{id}/reschedule` | Moves a draft or scheduled post to a new date and time | `reschedule_post` |
| POST | `/api/v1/posts/{id}/retry` | Sends failed sends again | `retry_post` |
| GET | `/api/v1/pinterest/boards` | The boards a Pinterest account can pin to | `list_pinterest_boards` |
| GET | `/api/v1/media` | Your media library and storage use | `list_media` |
| POST | `/api/v1/media/presign` | Checks a file and returns a one-time upload URL | `upload_media` |
| POST | `/api/v1/media/confirm` | Verifies an uploaded file and adds it to your library | `upload_media` |
| GET | `/api/v1/analytics` | How your posts and accounts performed | `get_analytics` |

Large video uploads use four more routes outside `/api/v1`, which also take the key: see [Large video: multipart upload](#large-video-multipart-upload).

## Accounts and platform rules

### GET /api/v1/accounts

Returns whose key this is and the accounts connected to that login. Removed accounts are left out.

```json
{
  "account": { "email": "you@example.com", "name": "Your Name" },
  "accounts": [
    { "id": "ACCOUNT_ID", "platform": "bluesky", "handle": "you.bsky.social",
      "displayName": "You", "nickname": null, "status": "active" }
  ]
}
```

Use an account `id` in `platforms` when creating a post to send to that one account rather than every account on the platform.

### GET /api/v1/platforms

One entry per platform: `maxChars`, `mediaKinds`, `maxImages`, `requiresMedia`, `requiresVideo`, `requiredOptions` (each with a `field` and a `message`) and, where the platform takes video, `video` limits (`formats`, `minDurationSec`, `maxDurationSec`, `maxSizeBytes`).

`requiredOptions` comes from asking each platform's own publishing code what an empty post is missing, so it lists only options that are required. Optional settings are not listed here.

## Posts

### POST /api/v1/posts/validate

Runs the same per-platform checks the publisher runs before it sends, and creates nothing.

```json
{
  "text": "Shipping v2 today.",
  "targets": [
    { "platform": "bluesky" },
    { "platform": "youtube", "options": { "ytTitle": "Shipping v2" } }
  ],
  "mediaIds": ["MEDIA_ID"]
}
```

- `targets`: one entry per platform, each with an optional `contentOverride` (different text for that platform) and `options`.
- `mediaIds`: up to 20 ids from your library, in attach order.
- Requests larger than 512 KB are refused with `413`.

The answer is `{ "ok": true, "issues": {} }` when nothing is wrong. Otherwise `issues` maps each platform to a list of `{ code, message, field?, severity? }`. An issue with `severity: "warn"` is advice and does not stop the post. It also reports a platform with no connected account (`no_account`) or whose account needs reconnecting (`account_signed_out`), with the reason when iHatePosting knows it.

One difference from creating: when you create a post, iHatePosting fills some options you left out from your text (a YouTube title and tags, a Pinterest title and link, Tumblr tags). Validation does not fill them, so it can report a missing YouTube title that creating would have supplied. Set the option yourself if you want both answers to agree.

### POST /api/v1/posts

```json
{
  "text": "Shipping v2 today. Changelog in the replies.",
  "platforms": ["bluesky", "linkedin"],
  "action": "draft"
}
```

| Field | Required | Notes |
|---|---|---|
| `text` | yes | Up to 65,000 characters. Cannot be empty. |
| `platforms` | yes | Platform names, account ids from `GET /api/v1/accounts`, or both. A platform name targets every active account on that platform. |
| `action` | yes | `draft`, `schedule` or `now`. There is no default: leaving it out returns `400`. `now` and `schedule` publish to real audiences. |
| `scheduledDate`, `scheduledTime` | with `schedule` | See [Conventions](#conventions). |
| `options` | no | Per-platform settings, keyed by platform name, for example `{ "pinterest": { "boardId": "BOARD_ID" } }`. |
| `overrides` | no | Different text for one platform, keyed by platform name. |
| `mediaIds` | no | Up to 20 library ids, in attach order. |

Response `201`:

```json
{
  "post": {
    "id": "POST_ID", "status": "draft", "scheduledAt": null,
    "targets": [{ "id": "TARGET_ID", "platform": "bluesky", "socialAccountId": "ACCOUNT_ID", "status": "pending" }]
  },
  "unresolved": ["linkedin"]
}
```

`unresolved` lists anything in `platforms` that matched no active account. It is always present, and empty when everything matched. If nothing matches at all, the request fails with `400`.

A post sent with `now` is stored as `scheduled` for the current moment and picked up by the publisher straight away.

**Refusals.** A `now` or `schedule` request is refused when:

- the post breaks a platform's rules (`400`, with the reason; the same checks as `/validate`)
- an Instagram handle you tagged or invited as a collaborator is one Instagram says it cannot tag (`400`)
- your 90-day free trial has ended (`403`; drafts can still be saved). Paid plans are not on sale yet, and until they are, this API check and the Free plan check below are switched off. The publisher still skips sends for an account whose trial has ended, and moves its scheduled posts back to drafts.
- it would go over your X post caps, which count per day and per month (30 a month on the free trial) (`403`, and the message names the cap)
- on the Free plan, a `schedule` request would go over the plan's monthly allowance of scheduled posts (`403`)

A draft skips those checks, with one exception: unless you are on a paid Pro plan, a post to X whose X text contains a link is refused (`403`) even as a draft. That includes the free trial. Use `overrides.x` to send X a version without the link.

### GET /api/v1/posts

Your 50 most recently created posts, newest first. Each has `id`, `baseContent`, `status`, `scheduledAt`, `publishedAt` and `targets`, where each target has `id`, `platform`, `status`, `externalUrl` (the live post, once published) and `error`. Deleted posts are left out. There are no filters and no paging.

### GET /api/v1/posts/{id}

The full post: `baseContent`, `status`, `scheduledAt`, `batchId`, each target's `socialAccountId`, `platform`, `contentOverride`, `options`, `status`, `externalUrl`, `error` and `notice` (something worth knowing about a send that did publish), and the attached `media` in order. `siblingCount` says how many other posts were saved together with this one (see PATCH below).

### PATCH /api/v1/posts/{id}

Replaces a `draft`, `scheduled` or `failed` post. The body is the whole post, not a partial update. `baseContent`, `accountIds` and `action` are required, and any options, overrides or media you leave out are removed. Read the post first and send back the full set.

The field names differ from creating:

```json
{
  "baseContent": "Shipping v2 today.",
  "accountIds": ["ACCOUNT_ID_1", "ACCOUNT_ID_2"],
  "action": "draft",
  "options": {},
  "overrides": {},
  "mediaIds": []
}
```

- `accountIds` takes account ids only, not platform names.
- `scheduledDate` and `scheduledTime` work as they do on create.
- A scheduled post cannot be turned back into a draft (`409`). Reschedule it, or delete it.
- Published, partly published and publishing posts cannot be edited (`409`).

**Posts to several accounts split when they are scheduled.** A draft to three accounts is one post. When a PATCH schedules it or sends it now, it becomes one post per account, sharing a `batchId`. The response is `{ "ok": true, "posts": 3, "batchId": "…" }`. After that:

- PATCH on any one of those posts is refused with `409`, because editing one row of the group would publish some platforms twice. Edit it in the iHatePosting app, or delete the posts and create them again.
- Reschedule and delete act on the one post you name, not the group.

`POST /api/v1/posts` never splits: it creates one post with one target per account.

### DELETE /api/v1/posts/{id}

Removes the post from iHatePosting. Deleting a scheduled post stops it from going out.

Deleting never removes anything from the social network. A post that has already published (`published` or `partial`) is refused with `409` and `"needsForce": true`, unless you add `?force=1`. With `force=1` only iHatePosting's record is removed, and the post stays live on the platform. A post that is `publishing` right now cannot be deleted, forced or not.

### POST /api/v1/posts/{id}/reschedule

```json
{ "scheduledDate": "2026-10-01", "scheduledTime": "9:00 AM" }
```

Works on `draft` and `scheduled` posts. It changes only the time and returns `{ "ok": true, "scheduledAt": "…" }`.

**Rescheduling a draft schedules it.** The draft becomes a scheduled post that will publish at the new time. This route does not run the platform checks that create does. The publisher still checks at send time and skips a send that breaks a platform's rules, so call `/validate` before you reschedule a draft. The trial end, the Free plan's scheduling allowance and the X post caps described under create do apply here.

### POST /api/v1/posts/{id}/retry

```json
{ "targetId": "TARGET_ID" }
```

Sends a post's failed sends again. Leave out `targetId` to retry every failed send on the post. Target ids appear in `GET /api/v1/posts` and in the create response. Sends that published are never re-sent.

Returns `{ "ok": true, "retried": 1 }`. Returns `409` when nothing on the post failed, or when every failed send's account needs reconnecting or was removed (the message says what to do). If only some of those accounts are affected, the other sends are retried. Returns `403` after the free trial has ended.

## Pinterest boards

### GET /api/v1/pinterest/boards?accountId=ACCOUNT_ID

Pinterest needs `options.pinterest.boardId`, and a board id cannot be guessed. This returns `{ "boards": [{ "id": "…", "name": "…" }], "accountId": "…", "handle": "…" }`, with up to the first 100 boards Pinterest lists.

- `accountId` picks which Pinterest account's boards to list. Without it, you get the most recently connected Pinterest account. Boards belong to one account, and a pin to another account's board fails.
- When there is no Pinterest account, or Pinterest refuses the lookup, the answer is still `200`, with an empty `boards` list and an `error` sentence.
- Successful answers are cached for 10 minutes, so a board you just made may take that long to appear.

## Media and uploads

### What you can upload

| Kind | Types | Largest file |
|---|---|---|
| Image | `image/jpeg`, `image/png`, `image/webp`, `image/gif` | 25 MB |
| Video | `video/mp4`, `video/quicktime`, `video/webm` | 512 MB with one PUT; 2,000 MB with a multipart upload |

These are iHatePosting's limits for storing a file. Each platform has its own limits too, which apply when a post is checked (see `video.maxSizeBytes` in `GET /api/v1/platforms`).

**Storage quota.** Your whole library counts against a quota: 500 MB in total on the Free plan and on the 90-day free trial. `GET /api/v1/media` returns your `usage.usedBytes` and `usage.quotaBytes`. An upload that would go over is refused with `413`.

### Three ways to upload

| Route | Size | Needs |
|---|---|---|
| MCP tool `upload_media` | Up to 8 MB, sent as base64 in the tool call | Nothing extra; the tool does all three steps for the agent |
| `presign` → PUT → `confirm` | Images up to 25 MB, video up to 512 MB | A client that can PUT a file |
| Multipart | Video up to 2,000 MB | A client that can PUT parts and read each part's `ETag` response header |

### GET /api/v1/media

Every file in your library, newest first, with `id`, `kind`, `mime`, `width`, `height`, `durationSec`, `sizeBytes`, `altText`, `storageKey`, `createdAt`, a `url` and a `thumbUrl`, plus a `usage` object for the whole library. The `url` is a public link to the stored file: treat it as shareable, and keep it out of logs you would not publish. There is no paging.

### Upload with presign, PUT and confirm

1. **Ask for an upload URL.**

   ```
   POST /api/v1/media/presign
   { "filename": "launch.mp4", "mime": "video/mp4", "sizeBytes": 48210331 }
   ```

   The answer is `{ "uploadUrl", "storageKey", "url", "kind" }`. The type, the declared size and your quota are checked here. A file over its kind's limit gets `413`. A video over 512 MB but within 2,000 MB gets `400` with `"useMultipart": true`.

2. **PUT the file** to `uploadUrl` with a `Content-Type` header equal to the `mime` you declared. Do not send your API key to this URL: it points at storage, and the signature in the URL is the permission. The URL expires after 10 minutes.

3. **Confirm it.**

   ```
   POST /api/v1/media/confirm
   { "storageKey": "…", "mime": "video/mp4", "label": "launch.mp4", "altText": "Product demo, 40 seconds" }
   ```

   `label` is required: a name for the file, up to 200 characters. `altText` is optional, up to 1,000 characters. Confirm checks the real size against the limits and your quota, and checks that the file's first bytes match its declared kind. A file that fails any check is deleted and refused. On success you get `201` and `{ "asset": { "id": "MEDIA_ID", … } }`. Put that `id` in `mediaIds`.

### Large video: multipart upload

For video over 512 MB, up to 2,000 MB. These routes live outside `/api/v1` and take the same `Authorization: Bearer pk_live_…` header.

1. `POST /api/media/multipart/create` with `{ "filename", "mime", "sizeBytes" }`. The checks are the same as presign. The answer is `{ "storageKey", "uploadId", "partBytes", "url", "kind" }`. `partBytes` is the part size to cut the file into (8 MB).
2. `POST /api/media/multipart/parts` with `{ "storageKey", "uploadId", "partNumbers": [1, 2, 3] }`, at most 100 part numbers per call. The answer is `{ "urls": [{ "partNumber", "url" }] }`. Each URL is valid for one hour.
3. PUT each part to its URL. Keep the `ETag` header from each response.
4. `POST /api/media/multipart/complete` with `{ "storageKey", "uploadId", "parts": [{ "PartNumber": 1, "ETag": "…" }] }`. A `409` means the parts did not assemble. Start that file again.
5. `POST /api/v1/media/confirm` as above.

If you give up part-way, `POST /api/media/multipart/abort` with `{ "storageKey", "uploadId" }` discards the parts.

## Analytics

### GET /api/v1/analytics

| Parameter | Values |
|---|---|
| `range` | `7d`, `15d`, `30d` (default), `90d`, `12m`, `all` |
| `format` | `xlsx` returns a spreadsheet file instead of JSON |
| `account` | With `format=xlsx`, limits the spreadsheet to one account id |

The JSON answer has one entry in `channels` per measured account, with its KPIs, a daily trend, top posts, audience figures and posting-time bands. `overview` gives the number of posts published, the top posts and posting-time coverage across those channels. `rangeSince` is the first day covered. For `all`, that is the earliest day iHatePosting has a record for, not the day the account was created. `unmeasuredPlatforms` names connected platforms that analytics leaves out because iHatePosting gets no post numbers for them. Two examples: Telegram has no per-post stats, and LinkedIn is left out when only a personal profile is connected (LinkedIn Pages are measured).

Analytics is the same on every plan, including the 12-month and all-time ranges and the spreadsheet export.

## Webhooks

Webhooks tell your own endpoint, or Zapier, Make or n8n, when a post finishes publishing. Step-by-step setup for those three tools: [Connect iHatePosting to Zapier, Make or n8n](https://ihateposting.com/guides/connect-ihateposting-to-zapier-make-n8n).

### Setting one up

Webhooks are managed in the browser, in **Settings → Webhooks**, not through the API key. You can have up to 10.

- The endpoint must be a public `https://` URL. Localhost and private addresses are refused.
- **Events:** `post.published`, `post.partial` and `post.failed`. A webhook made in Settings receives all three. Switch on `X-iHatePosting-Event` or the `event` field if you only care about some.
- **Accounts:** optionally pick which connected accounts a webhook covers. With none picked, it covers all of them. A scoped webhook fires when a post went to any of its accounts, and its payload includes only the sends to those accounts.
- The signing secret (`whsec_…`) is shown once, when you create the webhook. Editing the URL keeps the secret. Removing the webhook destroys it.
- **Send test** delivers a sample payload straight away, signed the same way as a real one, so you can build against it first.

### When deliveries happen

A post fires its event once, when it first reaches `published`, `partial` or `failed`. If you retry a failed send, the post settles again and fires again.

### The request

```
POST <your URL>
Content-Type: application/json
User-Agent: iHatePosting-Webhooks/1.0
X-iHatePosting-Event: post.partial
X-iHatePosting-Delivery: whd_…
X-iHatePosting-Signature: sha256=<hex>
```

```json
{
  "id": "whd_…",
  "event": "post.partial",
  "createdAt": "2026-10-01T09:00:04.000Z",
  "data": {
    "post": {
      "id": "POST_ID",
      "status": "partial",
      "content": "Shipping v2 today.",
      "scheduledAt": "2026-10-01T09:00:00.000Z",
      "publishedAt": "2026-10-01T09:00:03.000Z",
      "targets": [
        { "platform": "bluesky", "status": "published", "url": "https://bsky.app/…", "error": null },
        { "platform": "linkedin", "status": "failed", "url": null, "error": "…" }
      ]
    }
  }
}
```

- `targets` is always a list. `url` is null until the platform returns one, and `error` is null unless that send failed. The error is a readable sentence, not raw diagnostics.
- Test deliveries carry an extra `X-iHatePosting-Test: true` header, and `data.post.id` is `"sample"`.

### Verifying the signature

`X-iHatePosting-Signature` is `sha256=` followed by the hex HMAC-SHA256 of the raw request body, keyed with your `whsec_` secret. Compute it over the exact bytes you received, before parsing the JSON:

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function isFromIHatePosting(rawBody, signatureHeader, secret) {
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}
```

### Retries and dedupe

- Any `2xx` answer counts as delivered. Any other status, no answer within 15 seconds, or a redirect counts as a failed attempt. Redirects are not followed.
- A failed delivery is tried up to 5 times, with an exponentially growing wait that starts at 10 seconds.
- `id`, which equals the `X-iHatePosting-Delivery` header, stays the same across those attempts. Store it and ignore a delivery you have already handled.
- After 20 deliveries in a row fail, the webhook is switched off. Turn it back on in **Settings → Webhooks** once your endpoint works.

## What the API does not do

So that nothing here surprises you later:

- Creating, rotating and revoking API keys, and managing webhooks, happen in the browser only.
- `GET /api/v1/posts` has no filters or paging. It returns the 50 most recent posts.
- There is no per-post analytics endpoint. Analytics is per account, over a date range.
- Media must be uploaded as bytes. There is no upload from a URL.
- You cannot turn a scheduled post back into a draft. Delete it, or reschedule it.
- Each call creates one post. There is no batch create.
