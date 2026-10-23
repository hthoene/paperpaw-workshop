# The workshop's proxy

PaperPaw keys (`ppw-…`) for the PaperPaw Workshop: people try the workshop
without a Claude key of their own, for a while and up to a small budget.
The proxy speaks Anthropic's Messages API and passes a request on with
paperpaw.org's own key when the PaperPaw key allows it.

What a key has: a budget in dollars, an end date, the models it may use
(Haiku and Sonnet unless set otherwise), the most tokens an answer may
take, and a note. One request at a time per key.

What it keeps: the keys' SHA-256 (never the key), the requests for a key
(email, what they want to make), and per answer the model, the tokens and
the cost. Nothing said in a conversation is kept or logged.

## Routes

| Route | What it does |
|-------|--------------|
| `POST /v1/messages` | Anthropic's Messages API, streamed or not, with `x-api-key: ppw-…` |
| `GET /v1/key` | what a key allows: its models, budget, what it spent, its end |
| `GET /apply`, `POST /apply` | the form to ask for a key |
| `GET /health` | `ok` |

## Settings (`.env` beside `docker-compose.yml`)

Only the maintainer sets these, on the server. Never commit them.

| Name | What |
|------|------|
| `ANTHROPIC_API_KEY` | paperpaw.org's key, which pays |
| `SMTP_URL` | e.g. `smtps://user:password@mail.example.org:465` |
| `MAIL_FROM` | e.g. `PaperPaw <workshop@paperpaw.org>` |
| `ADMIN_EMAIL` | told of new requests |

Without `SMTP_URL` and `MAIL_FROM` no mail goes out; keys are then made
with `--print` and handed over by the admin.

## On the server

```sh
docker compose up -d --build
```

Caddy in front (in the server's Caddyfile):

```
workshop.paperpaw.org {
	reverse_proxy 127.0.0.1:8085
}
```

## The admin

```sh
docker compose exec proxy node src/admin.mjs requests
docker compose exec proxy node src/admin.mjs approve 3 --budget 5 --days 90
docker compose exec proxy node src/admin.mjs decline 4
docker compose exec proxy node src/admin.mjs keys
docker compose exec proxy node src/admin.mjs revoke 2
```

`approve` makes the key and mails it to who asked; the key is not shown
here. Options: `--budget <dollars>` (5), `--days <n>` (90),
`--models haiku,sonnet`, `--max-tokens <n>` (32000), `--note <text>`.

Nothing of this is deployed yet.
