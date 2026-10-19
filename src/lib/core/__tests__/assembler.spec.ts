import { describe, it, expect } from "vitest";
import { assembleCommand, escapeShellArg } from "#lib/core/assembler.js";
import { mockDockerCommand } from "./fixtures.js";

describe("command assembler", () => {
  it("correctly escapes arguments for bash", () => {
    expect(escapeShellArg("simple", "bash")).toBe("simple");
    expect(escapeShellArg("with space", "bash")).toBe('"with space"');
    expect(escapeShellArg("with$dollar", "bash")).toBe('"with\\$dollar"');
  });

  it("correctly escapes arguments for powershell", () => {
    expect(escapeShellArg("simple", "powershell")).toBe("simple");
    expect(escapeShellArg("with space", "powershell")).toBe('"with space"');
    expect(escapeShellArg('with"quote', "powershell")).toBe('"with`"quote"');
  });

  it("assembles a single-line command with proper ordering", () => {
    const values = {
      detach: true,
      name: "my-app",
      publish: "8080:80",
      image: "nginx:alpine",
      environment: [{ key: "NODE_ENV", value: "production" }],
    };

    const res = assembleCommand(mockDockerCommand, values, "single-line");

    // Expected order:
    // 1. baseBinary (docker) + subCommand (run)
    // 2. boolean flag (-d)
    // 3. flags with arguments (-e, -p, --name, --network)
    // 4. positional argument (nginx:alpine)
    expect(res.raw).toBe(
      "docker run -d --name my-app -p 8080:80 -e NODE_ENV=production nginx:alpine",
    );
    expect(res.hasErrors).toBe(false);
  });

  it("assembles a multiline bash command with line continuations", () => {
    const values = {
      detach: true,
      name: "my-app",
      image: "nginx:alpine",
    };

    const res = assembleCommand(mockDockerCommand, values, "bash");

    expect(res.raw).toContain("docker run \\\n");
    expect(res.raw).toContain("  -d \\\n");
    expect(res.raw).toContain("  nginx:alpine");
    expect(res.lines.length).toBeGreaterThan(1);
  });

  it("assembles a multiline powershell command with backtick continuation", () => {
    const values = {
      detach: true,
      image: "nginx:alpine",
    };

    const res = assembleCommand(mockDockerCommand, values, "powershell");

    expect(res.raw).toContain("docker run `\n");
    expect(res.raw).toContain("  -d `\n");
    expect(res.raw).toContain("  nginx:alpine");
  });

  it("produces interactive tokens linked to rule IDs", () => {
    const values = {
      name: "custom-web",
      image: "alpine",
    };

    const res = assembleCommand(mockDockerCommand, values, "single-line");

    const nameFlagToken = res.tokens.find((t) => t.text === "--name");
    expect(nameFlagToken).toBeDefined();
    expect(nameFlagToken?.ruleId).toBe("name");
    expect(nameFlagToken?.type).toBe("flag");

    const nameValueToken = res.tokens.find((t) => t.text === "custom-web");
    expect(nameValueToken).toBeDefined();
    expect(nameValueToken?.ruleId).toBe("name");
    expect(nameValueToken?.type).toBe("flag-value");

    const imageToken = res.tokens.find((t) => t.text === "alpine");
    expect(imageToken).toBeDefined();
    expect(imageToken?.ruleId).toBe("image");
    expect(imageToken?.type).toBe("positional");
  });

  it("ignores disabled or conflicting rules during assembly", () => {
    const values = {
      detach: true,
      interactive: true, // conflictsWith detach, should be excluded
      image: "alpine",
    };

    const res = assembleCommand(mockDockerCommand, values, "single-line");

    expect(res.raw).toContain("-d");
    expect(res.raw).not.toContain("-i");
  });

  it("marks tokens with errors when validation fails", () => {
    const values = {
      name: "invalid name!",
      image: "alpine",
    };

    const res = assembleCommand(mockDockerCommand, values, "single-line");

    expect(res.hasErrors).toBe(true);
    expect(res.errors["name"]).toBeDefined();

    const nameToken = res.tokens.find((t) => t.ruleId === "name" && t.type === "flag-value");
    expect(nameToken?.hasError).toBe(true);
  });
});
