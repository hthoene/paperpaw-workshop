// Where the workshop runs: on its own (docker compose, npm run dev), or on
// paperpaw.org, whose /workshop/config.json says where the emulator's frame
// is (an origin of its own there, sandbox.paperpaw.org).

export interface Hosting {
  /** The frame's address, absolute or beside the page. */
  frame: string;
  /** Whether plugins' requests may go to the internet: on one's own
   *  computer only (a switch, on by default); paperpaw.org forwards
   *  nothing, its plugins get recorded answers alone. */
  realNetwork: boolean;
}

const ON_ITS_OWN: Hosting = { frame: "frame.html", realNetwork: true };

export async function loadHosting(): Promise<Hosting> {
  try {
    const answer = await fetch(new URL("config.json", document.baseURI), { headers: { accept: "application/json" } });
    if (!answer.ok) return ON_ITS_OWN;
    // On its own the address answers the page itself (HTML), not JSON.
    const config = (await answer.json()) as { frame?: unknown };
    return typeof config.frame === "string" ? { frame: config.frame, realNetwork: false } : ON_ITS_OWN;
  } catch {
    return ON_ITS_OWN;
  }
}
