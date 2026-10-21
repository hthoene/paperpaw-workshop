import { t } from "../i18n";

/** PaperPaw's paw on its page, as on paperpaw.org. */
export function Paw() {
  return (
    <svg viewBox="12 12 96 96" aria-hidden="true">
      <path d="M24 12 H82 L108 38 V96 Q108 108 96 108 H24 Q12 108 12 96 V24 Q12 12 24 12 Z" fill="#1F1D1A" />
      <path d="M82 12 V30 Q82 38 90 38 H108 Z" fill="#45413c" />
      <g fill="#EE8FA4">
        <circle cx="40" cy="54" r="7.5" />
        <circle cx="58" cy="45" r="7.5" />
        <circle cx="76" cy="54" r="7.5" />
        <path d="M40 79 Q40 65 58 65 Q76 65 76 79 Q76 92 58 92 Q40 92 40 79 Z" />
      </g>
    </svg>
  );
}

export function Header() {
  return (
    <header class="top">
      <div class="in">
        <a class="logo" href="#/">
          <Paw />
          PaperPaw
        </a>
        <nav aria-label="PaperPaw">
          <a href="https://paperpaw.org/plugins">{t("nav.plugins")}</a>
          <a href="#/" aria-current="page">
            {t("nav.workshop")}
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Steps({ now }: { now: number }) {
  const steps = ["steps.idea", "steps.try", "steps.device", "steps.share"];
  return (
    <ol class="steps">
      {steps.map((key, i) => (
        <li key={key} aria-current={i === now ? "step" : undefined}>
          {i + 1} {t(key)}
        </li>
      ))}
    </ol>
  );
}
