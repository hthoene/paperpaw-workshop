import { render } from "preact";

import { App } from "./App";
import { appBackend, inApp, standInBackend } from "./backend";
import "./desktop.css";

render(<App backend={inApp() ? appBackend : standInBackend()} />, document.getElementById("app")!);
