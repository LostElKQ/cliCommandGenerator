import { describe, it, expect } from "vitest";
import {
  validateRuleValue,
  parseSerializedState,
  CommandDefinitionSchema,
} from "#lib/core/schemas.js";
import { mockDockerCommand } from "./fixtures.js";
import type { CommandRule } from "#lib/core/types.js";

describe("schemas and validation", () => {
  it("validates a correct CommandDefinition schema", () => {
    const parsed = CommandDefinitionSchema.safeParse(mockDockerCommand);
    expect(parsed.success).toBe(true);
  });

  it("validates string rule with regex", () => {
    const rule: CommandRule = {
      id: "name",
      flag: "--name",
      type: "string",
      label: "Name",
      description: "Desc",
      validator: {
        regex: "^[a-zA-Z0-9_-]+$",
        errorMessage: "Invalid name",
      },
    };

    expect(validateRuleValue(rule, "valid_name-123")).toEqual({ isValid: true });
    expect(validateRuleValue(rule, "invalid name with spaces")).toEqual({
      isValid: false,
      error: "Invalid name",
    });
    // Empty value should be considered valid (not yet active)
    expect(validateRuleValue(rule, "")).toEqual({ isValid: true });
  });

  it("validates number rule with min and max", () => {
    const rule: CommandRule = {
      id: "port",
      flag: "-p",
      type: "number",
      label: "Port",
      description: "Port number",
      validator: {
        min: 1,
        max: 65535,
        errorMessage: "Invalid port",
      },
    };

    expect(validateRuleValue(rule, 80)).toEqual({ isValid: true });
    expect(validateRuleValue(rule, 0)).toEqual({
      isValid: false,
      error: "Invalid port",
    });
    expect(validateRuleValue(rule, 70000)).toEqual({
      isValid: false,
      error: "Invalid port",
    });
    expect(validateRuleValue(rule, "not-a-number")).toEqual({
      isValid: false,
      error: "Invalid port",
    });
  });

  it("validates select rule against available options", () => {
    const rule: CommandRule = {
      id: "codec",
      flag: "-c:v",
      type: "select",
      label: "Codec",
      description: "Video codec",
      options: [
        { label: "H.264", value: "libx264" },
        { label: "H.265", value: "libx265" },
      ],
    };

    expect(validateRuleValue(rule, "libx264")).toEqual({ isValid: true });
    expect(validateRuleValue(rule, "invalid_codec")).toEqual({
      isValid: false,
      error: "Выбрано недопустимое значение",
    });
  });

  it("validates key-value-map rule", () => {
    const rule: CommandRule = {
      id: "env",
      flag: "-e",
      type: "key-value-map",
      label: "Env",
      description: "Environment",
    };

    expect(validateRuleValue(rule, [{ key: "FOO", value: "bar" }])).toEqual({ isValid: true });

    expect(validateRuleValue(rule, [{ key: "", value: "bar" }])).toEqual({
      isValid: false,
      error: "Ключ переменной не может быть пустым",
    });
  });

  it("parses valid serialized state", () => {
    const valid = {
      commandId: "docker-run",
      values: { detach: true, name: "web" },
      shell: "bash",
    };
    const parsed = parseSerializedState(valid);
    expect(parsed).toEqual(valid);
  });

  it("rejects invalid serialized state", () => {
    const invalid = {
      // missing commandId
      values: "not-an-object",
    };
    const parsed = parseSerializedState(invalid);
    expect(parsed).toBeNull();
  });
});
