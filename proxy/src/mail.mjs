// Mail through the SMTP server the maintainer configures (SMTP_URL, e.g.
// smtps://user:password@mail.example.org:465, and MAIL_FROM): the keys to
// the people who asked, new requests to the admin. Nothing else is sent.

/** A mailer for SMTP_URL, or none if it is not set. */
export async function smtpMailer(env = process.env) {
  if (!env.SMTP_URL || !env.MAIL_FROM) return undefined;
  const { createTransport } = await import("nodemailer");
  const transport = createTransport(env.SMTP_URL);
  return {
    send: ({ to, subject, text }) => transport.sendMail({ from: env.MAIL_FROM, to, subject, text }),
  };
}

/** The mail with a new key. */
export function keyMail({ key, models, budget, expires }) {
  const until = expires.slice(0, 10);
  return [
    "Hello,",
    "",
    "here is your PaperPaw key for the PaperPaw Workshop:",
    "",
    `    ${key}`,
    "",
    "Paste it into the workshop when it starts. Keep it to yourself: whoever has it uses your budget.",
    "",
    `It works with ${models.map((m) => m.replace(/^claude-/, "").replace(/-(\d)-(\d)$/, " $1.$2")).join(" and ")}, for up to $${budget.toFixed(2)}, until ${until}.`,
    "After that, a Claude key of your own goes on from where you are.",
    "",
    "Have fun making plugins,",
    "PaperPaw",
  ].join("\n");
}
