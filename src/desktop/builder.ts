// Plugins with code built on this computer (src-tauri's code.rs): the
// project saved first, then built as PaperPaw's emulator loads code, the
// compiler's messages back to the AI. The first build sets up Rust.

import type { BuildResult, Builder, ProjectFiles, Target } from "../build/client";
import type { Backend } from "./backend";

/** The words the Rust side says when Microsoft's C++ build tools are
 *  missing (toolchain.rs, NO_BUILD_TOOLS). */
export const NO_BUILD_TOOLS = "Plugins with code need Microsoft's C++ build tools";

export class LocalBuilder implements Builder {
  readonly target: Target = "host";

  constructor(
    private backend: Backend,
    /** The project's folder. */
    private project: () => string | undefined,
    /** Saves the project's files to its folder before they are built. */
    private saved: () => Promise<void>,
    /** Told when the build tools are missing, for the window to offer them. */
    private missing: () => void = () => {},
  ) {}

  async build(_files: ProjectFiles, _targets: Target[]): Promise<BuildResult> {
    await this.saved();
    const project = this.project();
    if (!project) throw new Error("There is no project to build.");
    try {
      return await this.backend.codeBuild(project);
    } catch (e) {
      if (String(e).includes(NO_BUILD_TOOLS)) this.missing();
      throw e;
    }
  }
}
