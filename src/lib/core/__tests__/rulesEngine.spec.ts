import { describe, it, expect } from "vitest";
import {
  getDefaultValues,
  evaluateRules,
  isRuleActive,
  isValueModified,
} from "#lib/core/rulesEngine.js";
import { mockDockerCommand } from "./fixtures.js";

describe("rules engine", () => {
  it("returns default values for all rules", () => {
    const defaults = getDefaultValues(mockDockerCommand);
    expect(defaults).toEqual({
      detach: false,
      interactive: false,
      name: "",
      image: "nginx:alpine",
      publish: "",
      network: "bridge",
      ip: "",
      environment: [],
    });
  });

  it("correctly detects modified values", () => {
    expect(isValueModified(false, false)).toBe(false);
    expect(isValueModified(true, false)).toBe(true);
    expect(isValueModified("", "")).toBe(false);
    expect(isValueModified("custom", "")).toBe(true);
    expect(isValueModified([], [])).toBe(false);
    expect(isValueModified([{ key: "A", value: "B" }], [])).toBe(true);
  });

  it("determines rule activity correctly", () => {
    const boolRule = mockDockerCommand.categories[0]?.rules[0];
    expect(boolRule).toBeDefined();
    if (!boolRule) return;
    expect(isRuleActive(boolRule, false)).toBe(false);
    expect(isRuleActive(boolRule, true)).toBe(true);

    const stringRule = mockDockerCommand.categories[0]?.rules[2];
    expect(stringRule).toBeDefined();
    if (!stringRule) return;
    expect(isRuleActive(stringRule, "")).toBe(false);
    expect(isRuleActive(stringRule, "  ")).toBe(false);
    expect(isRuleActive(stringRule, "my-app")).toBe(true);

    const kvRule = mockDockerCommand.categories[2]?.rules[0];
    expect(kvRule).toBeDefined();
    if (!kvRule) return;
    expect(isRuleActive(kvRule, [])).toBe(false);
    expect(isRuleActive(kvRule, [{ key: "K", value: "V" }])).toBe(true);
  });

  it("handles conflictsWith properly", () => {
    // When detach is active, interactive should be disabled
    const values = {
      detach: true,
      interactive: false,
    };

    const evals = evaluateRules(mockDockerCommand, values);
    expect(evals["detach"]?.isEnabled).toBe(true);
    expect(evals["interactive"]?.isEnabled).toBe(false);
    expect(evals["interactive"]?.disabledReason).toContain("Конфликтует");
  });

  it("handles dependsOn properly", () => {
    // network defaults to 'bridge', so ip has its dependency fulfilled
    const values = {
      network: "custom-net",
      ip: "172.20.0.5",
    };

    const evals = evaluateRules(mockDockerCommand, values);
    expect(evals["ip"]?.isEnabled).toBe(true);
    expect(evals["ip"]?.isVisible).toBe(true);

    // If network is empty/unset, ip should be disabled and hidden
    const withoutNetwork = {
      network: "",
      ip: "172.20.0.5",
    };
    const evalsWithoutNet = evaluateRules(mockDockerCommand, withoutNetwork);
    expect(evalsWithoutNet["ip"]?.isEnabled).toBe(false);
    expect(evalsWithoutNet["ip"]?.isVisible).toBe(false);
    expect(evalsWithoutNet["ip"]?.disabledReason).toContain("Требует включения");
  });

  it("reports validation errors in evaluations without crashing", () => {
    const values = {
      name: "invalid name with spaces!",
    };

    const evals = evaluateRules(mockDockerCommand, values);
    expect(evals["name"]?.isValid).toBe(false);
    expect(evals["name"]?.validationError).toBe(
      "Имя может содержать только буквы, цифры, дефис и подчеркивание",
    );
  });

  it("reports error when a required rule has an empty value", () => {
    const values = {
      image: "",
    };

    const evals = evaluateRules(mockDockerCommand, values);
    expect(evals["image"]?.isValid).toBe(false);
    expect(evals["image"]?.validationError).toBe("Обязательный параметр");
  });
});
