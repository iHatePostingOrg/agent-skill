# Changelog

Every release of this package, newest first. Versions follow
[Semantic Versioning](https://semver.org), and every manifest carries the same
one (`scripts/check.mjs` refuses a release where they differ). From 0.5.0
on, each version tag gets a GitHub Release with the notes below.

## 0.5.2 — 2026-09-28

- **Claude's plugin directory clears the plugin.** 0.5.1 was still held under
  "Uses a credential from the user's machine" with the same 3 findings, so
  the command-line fallback was not the cause. The directory named what it
  had matched: "the installer's pass $$". `pass` is also the Unix password
  manager, and ten phrases in the skill read like it: "pass `accountId`",
  "Pass `ytTitle` to both", "unless you pass `force: true`" and so on. They
  were in exactly the two files it flagged, SKILL.md and
  references/platform-options.md, and nowhere else. All ten now say send,
  give, set or accept, with the same meaning. Checked before release: the
  directory validated a branch with only this change and reported no policy
  holds.
- Run against the same checks, gitroomhq/postiz-agent is held for 9 findings
  of this kind and is listed anyway, so a hold goes to a reviewer rather than
  refusing a plugin. Ours no longer needs one.

## 0.5.1 — 2026-09-28

- **The skill no longer falls back to the command line.** Claude's plugin
  directory still held 0.5.0 for review under "Uses a credential from the
  user's machine", with 3 findings (down from 8). Read on the directory's own
  results page: the trigger was one line of the command-line section,
  `--media "$ID"`, which the scanner reads as the skill taking a variable
  from the user's environment. The skill also names a remote host
  (github.com links), so it was held as "a credential beside a remote url";
  `references/platform-options.md` was flagged only as part of the same
  skill, and `plugin.json` as the same finding plus the MCP server's
  address. The whole section is gone, with its `Bash(ihateposting …)`
  entries in `allowed-tools` and the compatibility line's key and CLI
  wording; no `$` is left anywhere in the skill. The plugin now works only
  through the server it adds, which every supported agent signs in to
  through the browser. For a file on the user's own computer the skill
  offers the upload box (`open_upload_widget`) and otherwise asks the person
  to upload it at ihateposting.com. The command line itself is unchanged and
  still documented in the README, with its own instructions
  (`ihateposting skill --print`).

## 0.5.0 — 2026-09-28

- **Cursor and Grok Build sign in too.** Their MCP servers pointed at
  `https://ihateposting.com/mcp` with a Bearer header filled from the
  `IHATEPOSTING_API_KEY` variable: a credential read from the user's
  environment and sent to a server. Claude's plugin directory held our 0.4.0
  submission for review over exactly that ("Uses a credential from the
  user's machine"), and xAI's catalog guidelines count it as sending a local
  secret to the network. Both now use `https://ihateposting.com/mcp/oauth`
  with no header, like Claude and Gemini CLI. Cursor's documentation says it
  runs OAuth with dynamic client registration by default; Grok Build's source
  (xai-org/grok-build, `xai-grok-mcp` oauth) does the same for plugin
  servers; and our server already accepts both clients' redirect addresses. The Cursor `variables`
  block is gone, and so is the Grok manifest's "set IHATEPOSTING_API_KEY"
  line. Anyone on 0.4.x signs in once.
- **The logo is an SVG.** A PNG is a file the directory's scanner cannot read,
  so every reference to it was held for review. The new logo, an SVG, is
  the brand mark as plain text, with no script and nothing fetched from
  elsewhere, and the release check keeps it that way. Cursor and Grok Build
  both name it, and the README shows it with Markdown image syntax.
- **Directory listing details.** The Claude manifest names a privacy policy
  and a support page, and the Claude, Cursor and Grok manifests give a
  support address for their author.
- **A Grok catalog entry** (`.grok-plugin/marketplace.json`) in the format
  the README of xai-org/plugin-marketplace documents, with brand-only
  keywords and the ihateposting.com domain.
- **The skill** gains a short "usual order" list, a table of what each tool
  does and which ones need the user's go-ahead, a "when something goes
  wrong" table, guidance for scheduling several posts, the accepted file
  types, how to post as one LinkedIn Page, and absolute links to the
  examples and docs. Two statements were wrong and are fixed: a
  multi-account post made with `create_post` DOES split into one post per
  account when it is scheduled or published, and `update_post` CAN edit one
  post of a split group as long as its accounts stay the same. The command
  line section now says what the CLI cannot do yet (per-network options).
  OpenClaw metadata was added to the frontmatter.
- **The README** links every agent's set-up page, covers the skills.sh
  install, a local Cursor install and the Grok sign-in, fixes the tool count
  (16, not 15), the URL upload limit (100 MB, not "any size"), and the
  command-line section (it has uploads and filters, not "text only"), and
  adds a Links section and a Feedback section. It no longer tells 0.4.x
  Cursor and Grok users to keep a key in their environment, and says how to
  retire the key they set.
- **docs/api.md** stops saying a key is shown only once (it can be shown
  again), that the post list has no filters or paging, that there is no
  upload from a link, and that `POST /api/v1/posts` never splits a
  multi-account post and a split post cannot be edited. It documents
  `POST /api/v1/media/from-url`, with its limit in the rate-limit table.
- **Five more examples**, all drafts: an Instagram Story, an Instagram trial
  reel, a Facebook Reel, a four-image LinkedIn post and a TikTok photo post;
  and X reply settings on the thread example. The examples guide no longer
  says `upload_media` needs a file of 8 MB or less, and prompts.md no longer
  says `list_posts` is the 50 newest.
- **Automation.** A `.gitignore` keeps macOS and Windows litter out (the
  directory refuses a plugin that holds it), the release check refuses
  binaries and litter and checks the README's tool count, and a new workflow
  publishes a GitHub Release for every version tag from now on, so the
  latest release cannot fall behind the tags again (it had: Gemini CLI was
  installing 0.3.3, because v0.3.4 and v0.4.0 have no Release).

## 0.4.0 — 2026-09-28

- **Claude signs in instead of asking for a key.** The plugin's server is now
  `https://ihateposting.com/mcp/oauth`, the address iHatePosting's listing in
  Claude's connector directory already uses, and the `api_key` setting is
  gone. A key only ever worked in terminal Claude Code: Cowork does not ask
  for a plugin's settings, and the VS Code extension and the desktop app could
  not collect the key
  ([anthropics/claude-code#89749](https://github.com/anthropics/claude-code/issues/89749)).
  Signing in works on claude.ai, in Cowork and in Claude Code alike, and
  someone who has both the directory connector and the plugin gets one set of
  tools, not two. Claude Code users coming from 0.3.x authenticate once from
  `/mcp`.
- **Every manifest says 0.4.0.** 0.3.4 was released with its manifests still
  at 0.3.3, so an install that goes by the version kept the old copy.
- **The skill no longer calls the CLI a fallback for text-only posts.** It
  has uploaded media since `ihateposting upload` arrived (0.3.4).

## 0.3.4 — 2026-09-27

- **`--check` was documented in the form that answers the wrong question.** The
  CLI fallback showed `post "text" --to bluesky,linkedin --check`, and a bare
  `--check` validates the command exactly as written — which, with no `--now`
  or `--at`, is a *draft*. Drafts are never counted against a plan's limits, so
  it answered "looks good" to a post that would later be refused. A customer's
  agent hit precisely that: it validated, was told the batch was fine, created
  53 posts and had 20 refused. The example now passes `--now`, and a note says
  to give `--check` the flags you are about to post with.
- **The skill repeated the guidance that caused the failure it warns about.**
  "Use `base64` only for something you generated yourself" — and a generated
  image IS the model's own output, so it is the single most likely thing to
  arrive truncated. A customer's ChatGPT generated an image, sent it as
  base64, and it was refused (presign 200, confirm 415, one second apart); it
  then asked the person to upload the image by hand rather than passing the
  URL the image already had. Now: prefer `url` always, generated pictures
  included, and treat an "incomplete" refusal as a signal to retry with the
  URL. Also notes that a link serving `application/octet-stream` is fine,
  which is what presigned S3, Drive and Dropbox links return.
- **"The CLI has no option for media" stopped being true.** It has
  `ihateposting upload <path>`, which reads a file off disk and prints a media
  id, and `--media` to attach it. That matters most for the case the skill is
  otherwise silent on: nothing reachable over MCP can read someone's
  filesystem, but a command running on their machine can. Both are now in the
  example block.

## 0.3.3 — 2026-09-25

- The Cursor **one-click install link** now installs the tagged URL too. 0.3.2
  updated every visible JSON block and missed this one, because its config is
  base64 inside a `cursor://` URL — invisible to a reader and to the release
  gate. Anyone who used the button instead of copying the block was still
  installing an untagged server.
- `scripts/check.mjs` now decodes those deeplinks and checks what the button
  actually installs, so the two can never drift apart again. It also asserts
  each config declares the RIGHT client id rather than merely having one — a
  file copy-pasted from another client is the failure that matters.
- This is the fix for 0.3.2 landing with a red CI check: the gate hardcoded the
  untagged URL and exact-matched it, so the release that added the tag failed
  its own test.

## 0.3.2 — 2026-09-25

- The three key-based configs now say which tool they are, as `?client=` on
  the server URL: `claude-code`, `cursor` and `grok`. An API key identifies a
  person and never an app, so until now every connector arrived anonymously
  and iHatePosting's own admin could only show the key's prefix — Claude Code,
  Cursor and a hand-written script were indistinguishable. The id is a public
  name, not a credential; nothing is granted on the strength of it, and an
  unrecognised value is simply ignored.
- `gemini-extension.json` is deliberately unchanged. It signs in over
  `/mcp/oauth`, so it is already named by its own registration and has nothing
  to declare.

## 0.3.1 — 2026-09-23

- The skill no longer tells a Gemini CLI user to fetch an API key. Gemini CLI
  discovers `skills/` at the extension root on its own — the official example
  declares nothing but a name and a version — so SKILL.md reaches the model
  there, and since 0.3.0 removed the key it was giving instructions that
  cannot be followed: `gemini extensions config ihateposting` now configures
  nothing, because there is no setting left to configure.
- "Check the key first" is now "Check the sign-in first", and it sends a
  Gemini CLI user to `/mcp auth ihateposting` instead. It also says outright
  never to ask that user for a key: there is nowhere to put one, and a key in
  a header would be blanked before it left the machine.
- `compatibility` now says an account is what is required, and that most
  agents send a key while Gemini CLI signs in.

## 0.3.0 — 2026-09-23

- Gemini CLI now signs in with OAuth instead of taking an API key, and the
  extension points at `https://ihateposting.com/mcp/oauth`. The key never
  worked there: Gemini CLI expands `${...}` in MCP headers against a
  sanitized environment and blanks any variable whose NAME matches
  `/KEY/i`, `/TOKEN/i`, `/SECRET/i` or `/AUTH/i`, so the Authorization
  header built from the key variable was sent as a bare `Bearer ` and every
  call returned 401. Nothing in Google's documentation
  says this, and their own worked example hardcodes the token.
  (gemini-cli `packages/core/src/tools/mcp-client.ts` →
  `createTransportRequestInit`, and
  `packages/core/src/services/environmentSanitization.ts`.)
- `oauth.enabled` is set explicitly, because Gemini CLI only starts the
  sign-in by itself when it is true — "Only trigger automatic OAuth if
  explicitly enabled in config". Without it a user gets a 401 and is left to
  run `/mcp auth ihateposting` by hand.
- Nothing changed on the server: the sign-in uses the OAuth 2.1 endpoints
  iHatePosting already publishes, which Gemini CLI finds through the same
  RFC 9728 metadata Claude uses.
- `scripts/check.mjs` now asserts the Gemini extension has no headers and no
  settings, and that `oauth.enabled` is true, so the redaction trap cannot
  come back unnoticed.
- The other three agents are unchanged and still send the API key.

## 0.2.0 — 2026-09-22

- README now starts with what an agent can do, then lists the 15 tools, the
  14 networks, media, analytics, other ways to connect, the REST API,
  webhooks, limits and troubleshooting. Install steps for each agent are in
  collapsible sections.
- New `docs/platforms.md`: what each network accepts and its main options.
- New `docs/api.md`: the REST API, uploads and webhooks.
- New `skills/ihateposting/references/platform-options.md`: the option keys
  per network, which the skill reads when a post needs them.
- New `examples/`: draft-only `create_post` payloads and example prompts.
- The skill covers more: rescheduling a draft makes it publish, a
  multi-network post splits when `update_post` schedules it, TikTok privacy
  and inbox drafts, held sends, and the rate limit of each tool.
- Manifest keywords list all 14 networks.
- `scripts/check.mjs` also checks that the README names every tool and
  network, that the skill names only real tools, and that every example is a
  draft. `.github/workflows/check.yml` runs it on every push and pull request.

## 0.1.0 — 2026-09-22

- First release: the plugin for Claude Code, Cursor, Gemini CLI and Grok
  Build, the hosted MCP server connection and the `ihateposting` skill.
