import { describe, it, expect } from "vitest";
import { assembleCommand, escapeShellArgument } from "#lib/core/assembler.js";
import { mockDockerCommand } from "./fixtures.js";

describe("command assembler", () => {
  it("correctly escapes arguments for bash", () => {
    expect(escapeShellArgument("simple", "bash")).toBe("simple");
    expect(escapeShellArgument("with space", "bash")).toBe('"with space"');
    expect(escapeShellArgument("with$dollar", "bash")).toBe(String.raw`"with\$dollar"`);
  });

  it("correctly escapes arguments for powershell", () => {
    expect(escapeShellArgument("simple", "powershell")).toBe("simple");
    expect(escapeShellArgument("with space", "powershell")).toBe('"with space"');
    expect(escapeShellArgument('with"quote', "powershell")).toBe('"with`"quote"');
  });

  it("assembles a single-line command with proper ordering", () => {
    const values = {
      detach: true,
      name: "my-app",
      publish: "8080:80",
      image: "nginx:alpine",
      environment: [{ key: "NODE_ENV", value: "production" }],
    };

    const result = assembleCommand(mockDockerCommand, values, "single-line");

    // Expected order:
    // 1. baseBinary (docker) + subCommand (run)
    // 2. boolean flag (-d)
    // 3. flags with arguments (-e, -p, --name, --network)
    // 4. positional argument (nginx:alpine)
    expect(result.raw).toBe(
      "docker run -d --name my-app -p 8080:80 -e NODE_ENV=production nginx:alpine",
    );
    expect(result.hasErrors).toBe(false);
  });

  it("assembles a multiline bash command with line continuations", () => {
    const values = {
      detach: true,
      name: "my-app",
      image: "nginx:alpine",
    };

    const result = assembleCommand(mockDockerCommand, values, "bash");

    expect(result.raw).toContain("docker run \\\n");
    expect(result.raw).toContain("  -d \\\n");
    expect(result.raw).toContain("  nginx:alpine");
    expect(result.lines.length).toBeGreaterThan(1);
  });

  it("assembles a multiline powershell command with backtick continuation", () => {
    const values = {
      detach: true,
      image: "nginx:alpine",
    };

    const result = assembleCommand(mockDockerCommand, values, "powershell");

    expect(result.raw).toContain("docker run `\n");
    expect(result.raw).toContain("  -d `\n");
    expect(result.raw).toContain("  nginx:alpine");
  });

  it("produces interactive tokens linked to rule IDs", () => {
    const values = {
      name: "custom-web",
      image: "alpine",
    };

    const result = assembleCommand(mockDockerCommand, values, "single-line");

    const nameFlagToken = result.tokens.find((t) => t.text === "--name");
    expect(nameFlagToken).toBeDefined();
    expect(nameFlagToken?.ruleId).toBe("name");
    expect(nameFlagToken?.type).toBe("flag");

    const nameValueToken = result.tokens.find((t) => t.text === "custom-web");
    expect(nameValueToken).toBeDefined();
    expect(nameValueToken?.ruleId).toBe("name");
    expect(nameValueToken?.type).toBe("flag-value");

    const imageToken = result.tokens.find((t) => t.text === "alpine");
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

    const result = assembleCommand(mockDockerCommand, values, "single-line");

    expect(result.raw).toContain("-d");
    expect(result.raw).not.toContain("-i");
  });

  it("marks tokens with errors when validation fails", () => {
    const values = {
      name: "invalid name!",
      image: "alpine",
    };

    const result = assembleCommand(mockDockerCommand, values, "single-line");

    expect(result.hasErrors).toBe(true);
    expect(result.errors["name"]).toBeDefined();

    const nameToken = result.tokens.find((t) => t.ruleId === "name" && t.type === "flag-value");
    expect(nameToken?.hasError).toBe(true);
  });
});
