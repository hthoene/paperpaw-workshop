// The proxy as it runs on the server: its settings from the environment
// (.env beside docker-compose.yml, set by the maintainer). Says where it
// listens and nothing of the settings' values.

import { mkdirSync } from "node:fs";
import path from "node:path";

import { Store } from "./db.mjs";
import { smtpMailer } from "./mail.mjs";
import { createProxy } from "./server.mjs";

const env = process.env;
if (!env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set: the proxy has nothing to pass requests on with.");
  process.exit(1);
}
const dir = env.DATA_DIR ?? "data";
mkdirSync(dir, { recursive: true });
const mailer = await smtpMailer(env);
const server = createProxy({
  store: new Store(path.join(dir, "proxy.db")),
  apiKey: env.ANTHROPIC_API_KEY,
  mailer,
  adminEmail: env.ADMIN_EMAIL,
});
const port = Number(env.PORT ?? 8080);
server.listen(port, () => console.log(`PaperPaw's workshop proxy on port ${port}${mailer ? ", mail configured" : ", no mail configured"}`));
