# The store's API for the workshop

The workshop sends plugins to the store on paperpaw.org the way its form
at `/submit` does, as the signed-in author. These are the requests it
makes ([src/publish/store.ts](../src/publish/store.ts)) and the answers
it expects. The site's form stays as it is; the API is the same routes
answering JSON when the request asks for it (`Accept: application/json`),
plus one new address that says where the store stands.

The workshop lives on paperpaw.org itself (`/workshop`), so its requests
are same-origin: the session cookie (`paperpaw_session`) comes with them,
the site's same-site guard lets them through, and no CORS is needed.

## Where the store stands

```
GET /api/v1/workshop/session
Accept: application/json
```

Always `200`, `Cache-Control: no-store`, and present whether the store
is open or not:

| Situation | Answer |
|---|---|
| Store not open yet | `{"store": "closed"}` |
| Open, nobody signed in | `{"store": "open", "account": null}` |
| Open, signed in | `{"store": "open", "account": {"name": "Ada"}, "csrf": "<the session's token>"}` |

`csrf` is the session's own form token, the one the site's forms carry.
Only pages of the site can read the answer (no CORS headers), so it is
as safe as putting it into a form.

Anything else (no such address, not JSON, no connection) means: no store
here. That is the workshop on someone's own computer; the share page then
offers the package as a download to upload at paperpaw.org/submit.

To sign in, the workshop links to the site's own page:
`/account/sign-in?next=/workshop/%23/p/<project>/share`. The mail's link
brings the author back to the share page, signed in.

## Uploading: a draft

```
POST /submit
Accept: application/json
Content-Type: multipart/form-data

csrf        the session's token
package     the plugin's folder as a ZIP, with store/ inside
build-<device>, source-zip   for plugins with code, as the form takes them
```

The package carries the whole entry, so one request makes a complete
draft: `store/store.ini` (`[store]` with `summary`, `description`, `group`,
`tags`, `licence`, `source`; `[screenshots]` with what each picture
shows) and the screenshots as `store/1-x4.png`, `store/2-x4-pro.png` and
so on, numbered because the store shows them in the order of their names.
This is what the site's `upload.rs` reads already.

`201` with the draft:

```json
{
  "submission": 7,
  "passed": true,
  "checks": [{ "check": "manifest", "status": "pass", "message": "plugin.ini names Night owl, night-owl, version 1.0.0." }],
  "draft": "/submit/7",
  "page": "/submit/7/page"
}
```

`passed` is whether it may be sent as it is; `checks` are the checker's
report (`status` is `pass`, `warn` or `fail`). A draft that did not pass
is still made; the author completes it on its draft page.

## Sending it to the moderators

```
POST /submit/{n}/send
Accept: application/json
Content-Type: application/x-www-form-urlencoded

csrf=<the session's token>
```

`200` with `{"submission": 7, "state": "pending"}`. If the check fails at
this point (another plugin took the id meanwhile), `422` with `checks`.

## Refusals

Every refusal is JSON with the status the form uses already:

```json
{ "error": "quota", "message": "Your submissions take more room than the store keeps.", "checks": [] }
```

| Status | `error` | When |
|---|---|---|
| 401 | `signed-out` | No session (the form redirects to the sign-in instead) |
| 403 | `expired` | Wrong or old `csrf`, a blocked account, a draft no longer a draft |
| 404 | `closed` | The store is not open |
| 413 | `quota` | More than the room an author has |
| 422 | `refused` | The upload is not a plugin the store takes; `checks` say why |
| 429 | `too-many` | More submissions today than allowed |
| 503 | `busy` | Too many uploads at once |

The workshop shows its own words for each status and the site's
`message` where it has none.

## Not yet

- **Plugins with code** (phase 4 and 5): the same upload with
  `build-<device>` (signed `.ppn` files) and `source-zip`. Signing happens
  in the workshop's page with the code of `/authors/sign` and the author's
  key file; `Upload.builds` and `Upload.source` are ready for it.
- **Counting**: the site counts "submitted from the workshop" as a daily
  sum with the usage counts (S5), nothing personal.
