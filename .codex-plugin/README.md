# ChatGPT / Codex plugin

The package submitted to OpenAI's plugin portal, kept here because it was the
only vendor's manifest that lived nowhere. Three submissions turned on
undocumented portal behaviour, and the build that finally configured cleanly
existed solely as a ZIP in a Downloads folder — recovered 2026-10-24 by
exporting version 1.0.0 from the portal.

## Building the ZIP

The archive OpenAI accepts has this shape, flat at the root:

```
.codex-plugin/plugin.json
.mcp.json
assets/composer-icon.png
assets/logo.png
skills/ihateposting/SKILL.md      <- the variant in THIS directory, not the repo's
```

`SKILL.md` here is deliberately a **stripped** copy: the shared
`skills/ihateposting/SKILL.md` carries frontmatter for the other five vendors
(`license`, `compatibility`, `metadata`, `allowed-tools`) that the Codex
package does not ship. Copy this one into `skills/ihateposting/` when
assembling, and do not overwrite the shared file with it.

## What the portal will reject you for

Everything below cost a submission. None of it is in OpenAI's documented
error catalogue (developers.openai.com/plugins/deploy/submission-errors).

- `interface` sits at the TOP LEVEL of plugin.json; `review` and
  `publication` nest under `extensions["com.openai"]`.
- `capabilities` is an ARRAY OF STRINGS.
- The URL keys end in **URL**, not Url: `websiteURL`, `supportURL`,
  `privacyPolicyURL`, `termsOfServiceURL`.
- `.mcp.json` uses `"type": "streamable-http"`, never `"http"`.
- The MCP URL is `https://ihateposting.com/mcp/oauth` — never `/mcp` — and is
  LOCKED to the app once created. Changing it in the ZIP gives "MCP URL must
  match the existing app"; a second app holding the same URL gives "This MCP
  URL is already used by another app", and connectors created in ChatGPT
  count as apps.
- `category` must come from the documented list. **Communication**, not
  Productivity: Productivity produced a recurring "we couldn't confirm the
  selected category" warning on every upload.
- `demo_recording_url` is a ZIP field under `extensions["com.openai"].review`;
  release notes are a FORM field and are user-visible.
- **Reviewer credentials are a PORTAL form, not a ZIP field** — Add review
  information → step 2: sign-in method, Login URL, Tenant, Username, Password,
  Sign-in steps. Nothing in plugin.json carries them, so no amount of reading
  the manifest finds them, and "no demo credentials" was half of the
  2026-10-07 rejection. Leave Tenant blank; the app has no tenancy.

## The publisher name

`author.name` and `interface.developerName` are the publisher and must match
the identity verified on the OpenAI organisation — for the package now in
review, **Parag Hasmukhbhai Gajera** — spelled exactly as the portal's own
Developer identity selector shows it, which is what a reviewer compares
against. Approved under Individual verification. They are NOT the app's name:
`interface.displayName` stays "iHatePosting".

The 2026-10-24 rejection was exactly this mismatch — both fields read
"iHatePosting" while the verified identity was a person, so the reviewer could
not confirm the publisher owned the brand. Renaming the OpenAI *organisation*
does not help: that field is a display label, not the verified identity. The
fix was to resubmit from the account whose verified individual is the person
named above.

Domain ownership is the bridge for the brand itself:
`OPENAI_APPS_CHALLENGE` is served from the main app at
`/.well-known/openai-apps-challenge`, and every URL in the listing is on
ihateposting.com. **A NEW ORGANISATION ISSUES A NEW TOKEN** — the old value
does not carry over, and until the new one is served the MCPs tab reads
"Domain not verified". Setting it means editing `/opt/ihateposting/web.env` on
the VPS and recreating the web container with `deploy/web-swap.sh`; that is a
container recreate from the same image, so no code ships and nothing is
written to deploy.log. Check it with a byte comparison of
`https://ihateposting.com/.well-known/openai-apps-challenge` against the token
before clicking Verify Domain — the route serves the value trimmed, with no
trailing newline. `www.` 301s to the apex, so leave the Challenge Base URL
blank.
