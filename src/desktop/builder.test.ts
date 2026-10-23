import { describe, expect, it } from "vitest";

import { standInBackend } from "./backend";
import { LocalBuilder, NO_BUILD_TOOLS } from "./builder";

describe("a build on this computer", () => {
  it("saves first, and says when Microsoft's build tools are missing", async () => {
    const backend = standInBackend();
    const order: string[] = [];
    backend.codeBuild = async () => {
      order.push("built");
      throw new Error(`${NO_BUILD_TOOLS} on Windows (Visual Studio Build Tools, the C++ workload).`);
    };
    let missing = 0;
    const builder = new LocalBuilder(backend, () => "Clock", async () => void order.push("saved"), () => missing++);
    await expect(builder.build({}, ["host"])).rejects.toThrow(NO_BUILD_TOOLS);
    expect(order).toEqual(["saved", "built"]);
    expect(missing).toBe(1);
    backend.codeBuild = async () => {
      throw new Error("the compiler stopped");
    };
    await expect(builder.build({}, ["host"])).rejects.toThrow("compiler");
    expect(missing).toBe(1);
  });
});
