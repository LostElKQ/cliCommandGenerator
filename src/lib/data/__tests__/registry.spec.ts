import { describe, expect, it } from "vitest";
import { assembleCommand } from "#lib/core/assembler.js";
import { evaluateRules, getDefaultValues, isValueModified } from "#lib/core/rulesEngine.js";
import { CommandDefinitionSchema } from "#lib/core/schemas.js";
import { COMMANDS, getCommandById, getDefaultCommand } from "#lib/data/registry.js";

describe("command registry & datasets", () => {
  it("validates that all registered commands conform to CommandDefinitionSchema", () => {
    expect(COMMANDS.length).toBeGreaterThanOrEqual(3);

    for (const command of COMMANDS) {
      const parsed = CommandDefinitionSchema.safeParse(command);
      expect(parsed.success).toBe(true);
    }
  });

  it("retrieves commands by id and handles unknown commands", () => {
    const docker = getCommandById("docker-run");
    expect(docker).toBeDefined();
    expect(docker?.baseBinary).toBe("docker");

    const ffmpeg = getCommandById("ffmpeg");
    expect(ffmpeg).toBeDefined();
    expect(ffmpeg?.baseBinary).toBe("ffmpeg");

    const git = getCommandById("git-commit");
    expect(git).toBeDefined();
    expect(git?.baseBinary).toBe("git");

    const unknown = getCommandById("unknown-command-id");
    expect(unknown).toBeUndefined();
  });

  it("provides default command", () => {
    const defaultCommand = getDefaultCommand();
    expect(defaultCommand).toBeDefined();
    expect(defaultCommand.id).toBe("docker-run");
  });

  it("assembles docker-run with default values and flags required missing image", () => {
    const docker = getCommandById("docker-run");
    expect(docker).toBeDefined();
    if (!docker) return;

    const defaults = getDefaultValues(docker);
    const evals = evaluateRules(docker, defaults);
    const assembled = assembleCommand(docker, defaults, "single-line", evals);

    expect(assembled.raw).toBe("docker run");
    expect(assembled.hasErrors).toBe(true);
    expect(evals["image"]?.isValid).toBe(false);
  });

  it("assembles docker-run with options, cpus, and image", () => {
    const docker = getCommandById("docker-run");
    expect(docker).toBeDefined();
    if (!docker) return;

    const values = {
      ...getDefaultValues(docker),
      cpus: 1.5,
      detach: true,
      image: "nginx:alpine",
      name: "web-server",
      publish: ["8080:80", "443:443"],
    };

    const assembled = assembleCommand(docker, values, "single-line");
    expect(assembled.raw).toBe(
      "docker run -d --name web-server -p 8080:80 -p 443:443 --cpus 1.5 nginx:alpine",
    );

    // rm conflicts with restart
    const conflictValues = {
      ...values,
      restart: "always",
      rm: true,
    };
    const evals = evaluateRules(docker, conflictValues);
    expect(evals["restart"]?.isEnabled).toBe(false);
    expect(evals["restart"]?.disabledReason).toContain("Конфликтует");
  });

  it("assembles ffmpeg command with video and audio options", () => {
    const ffmpeg = getCommandById("ffmpeg");
    expect(ffmpeg).toBeDefined();
    if (!ffmpeg) return;

    const values = {
      ...getDefaultValues(ffmpeg),
      input: "input.mp4",
      output: "output.mp4",
    };
    const evals = evaluateRules(ffmpeg, values);
    const assembled = assembleCommand(ffmpeg, values, "single-line", evals);

    expect(assembled.raw).toContain("ffmpeg -y -i input.mp4");
    expect(assembled.raw).toContain("-c:v libx264");
    expect(assembled.raw).toContain("-crf 23");
    expect(assembled.raw).toContain("-preset medium");
    expect(assembled.raw).toContain("-c:a aac");
    expect(assembled.raw).toContain("-b:a 192k");
    expect(assembled.raw).toContain("output.mp4");
    expect(assembled.hasErrors).toBe(false);
  });

  it("ffmpeg respects -vn (disable video) and -an (disable audio) conflicts", () => {
    const ffmpeg = getCommandById("ffmpeg");
    expect(ffmpeg).toBeDefined();
    if (!ffmpeg) return;

    const values = {
      ...getDefaultValues(ffmpeg),
      disableAudio: true,
      disableVideo: true,
      input: "input.mp4",
      output: "output.mp4",
    };

    const evals = evaluateRules(ffmpeg, values);
    expect(evals["videoCodec"]?.isEnabled).toBe(false);
    expect(evals["crf"]?.isEnabled).toBe(false);
    expect(evals["audioCodec"]?.isEnabled).toBe(false);
    expect(evals["audioBitrate"]?.isEnabled).toBe(false);

    const assembled = assembleCommand(ffmpeg, values, "single-line", evals);
    expect(assembled.raw).toBe("ffmpeg -y -vn -an -i input.mp4 output.mp4");
  });

  it("assembles git-commit command with commit message and flags", () => {
    const git = getCommandById("git-commit");
    expect(git).toBeDefined();
    if (!git) return;

    const values = {
      ...getDefaultValues(git),
      all: true,
      gpgSign: true,
      message: "feat: add user login",
      signoff: true,
    };

    const assembled = assembleCommand(git, values, "single-line");
    expect(assembled.raw).toBe('git commit -s -a -S -m "feat: add user login"');
    expect(assembled.hasErrors).toBe(false);
  });

  it("ensures defaultValue matches rule type for all registered commands", () => {
    for (const command of COMMANDS) {
      for (const cat of command.categories) {
        for (const rule of cat.rules) {
          if (rule.defaultValue === undefined || rule.defaultValue === "") {
            continue;
          }

          if (rule.type === "number") {
            expect(
              typeof rule.defaultValue,
              `Rule '${rule.id}' in '${command.id}' has type 'number' but defaultValue is '${typeof rule.defaultValue}'`,
            ).toBe("number");
          } else if (rule.type === "boolean") {
            expect(
              typeof rule.defaultValue,
              `Rule '${rule.id}' in '${command.id}' has type 'boolean' but defaultValue is '${typeof rule.defaultValue}'`,
            ).toBe("boolean");
          }
        }
      }
    }
  });

  it("demonstrates the issue when defaultValue is string for a number rule", () => {
    // Проблема 1: Ложное срабатывание isValueModified из-за несовпадения типов
    const numericInput = 23;
    const stringDefault = "23";
    const numericDefault = 23;

    // Сравнение числа 23 со строкой "23" дает true (система ошибочно считает значение измененным)
    expect(isValueModified(numericInput, stringDefault)).toBe(true);

    // Сравнение числа 23 с числом 23 дает false (корректно)
    expect(isValueModified(numericInput, numericDefault)).toBe(false);
  });
});
