import type { CommandDefinition, CommandRule, EvaluationMap } from "./types.js";
import { validateRuleValue } from "./schemas.js";
import { isNullish } from "#lib/utilities.js";

/**
Получить плоский список всех правил команды
*/
export function getAllRules(definition: CommandDefinition): CommandRule[] {
  return definition.categories.flatMap((cat) => cat.rules);
}

/**
Найти правило по его идентификатору
*/
export function findRuleById(
  definition: CommandDefinition,
  ruleId: string,
): CommandRule | undefined {
  for (const cat of definition.categories) {
    const found = cat.rules.find((r) => r.id === ruleId);
    if (found) return found;
  }
  return undefined;
}

/**
Определяет, считается ли правило "активным" (включенным пользователем)
*/
export function isRuleActive(rule: CommandRule, value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  switch (rule.type) {
    case "boolean": {
      return value === true;
    }

    case "string":
    case "path": {
      return typeof value === "string" && value.trim().length > 0;
    }

    case "number": {
      return typeof value === "number"
        ? !Number.isNaN(value)
        : typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Number(value));
    }

    case "select": {
      return value !== "" && value !== undefined && value !== null;
    }

    case "key-value-map": {
      return Array.isArray(value)
        ? value.some((kv) => kv && typeof kv === "object" && String(kv.key || "").trim().length > 0)
        : false;
    }

    case "list": {
      return Array.isArray(value) ? value.length > 0 : false;
    }

    default: {
      return Boolean(value);
    }
  }
}

/**
Сравнение значения с дефолтным
*/
export function isValueModified(value: unknown, defaultValue: unknown): boolean {
  if (value === defaultValue) return false;
  return isNullish(value) && isNullish(defaultValue)
    ? false
    : JSON.stringify(value) !== JSON.stringify(defaultValue);
}

/**
Получить значения по умолчанию для всех правил команды
*/
export function getDefaultValues(definition: CommandDefinition): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const rules = getAllRules(definition);

  for (const rule of rules) {
    if (rule.defaultValue !== undefined) {
      result[rule.id] = structuredClone(rule.defaultValue);
      continue;
    }

    switch (rule.type) {
      case "boolean": {
        result[rule.id] = false;
        continue;
      }
      case "number": {
        result[rule.id] = undefined;
        continue;
      }
      case "select": {
        result[rule.id] = rule.options?.[0]?.value ?? "";
        continue;
      }
      case "key-value-map":
      case "list": {
        result[rule.id] = [];
        continue;
      }
      case "string":
      case "path": {
        result[rule.id] = "";
        continue;
      }
    }
  }

  return result;
}

/**
Вычисляет состояние доступности, видимости и валидности для всех правил
*/
export function evaluateRules(
  definition: CommandDefinition,
  values: Record<string, unknown>,
): EvaluationMap {
  const rules = getAllRules(definition);
  const rulesById = new Map<string, CommandRule>(rules.map((r) => [r.id, r]));
  const evaluations: EvaluationMap = {};

  // 1-й проход: вычисление базовой активности и модификации каждого правила
  const activeStatus = new Map<string, boolean>();
  const modifiedStatus = new Map<string, boolean>();
  for (const rule of rules) {
    const value = values[rule.id];
    activeStatus.set(rule.id, isRuleActive(rule, value));
    modifiedStatus.set(rule.id, isValueModified(value, rule.defaultValue));
  }

  // 2-й проход: зависимости, конфликты и валидация
  for (const rule of rules) {
    const value = values[rule.id];
    const active = activeStatus.get(rule.id) ?? false;
    const isModified = modifiedStatus.get(rule.id) ?? false;
    let isEnabled = true;
    let isVisible = true;
    let disabledReason: string | undefined;

    // Проверка dependsOn
    if (rule.dependsOn && rule.dependsOn.length > 0) {
      const missingDependencies: string[] = [];
      for (const dependencyId of rule.dependsOn) {
        const dependencyRule = rulesById.get(dependencyId);
        const dependencyActive = activeStatus.get(dependencyId) ?? false;
        if (!dependencyActive) {
          missingDependencies.push(
            dependencyRule ? dependencyRule.flag || dependencyRule.label : dependencyId,
          );
        }
      }

      if (missingDependencies.length > 0) {
        isEnabled = false;
        isVisible = false;
        disabledReason = `Требует включения: ${missingDependencies.join(", ")}`;
      }
    }

    // Проверка conflictsWith (только если правило еще не заблокировано)
    if (isEnabled && rule.conflictsWith && rule.conflictsWith.length > 0) {
      const conflictingRules: string[] = [];
      for (const conflictId of rule.conflictsWith) {
        const conflictRule = rulesById.get(conflictId);
        const conflictActive = activeStatus.get(conflictId) ?? false;
        const conflictModified = modifiedStatus.get(conflictId) ?? false;

        // Конфликт блокирует правило, если конфликтное правило активно и
        // либо конфликтное правило явно изменено пользователем, либо текущее не изменено
        if (conflictActive && (conflictModified || !isModified)) {
          conflictingRules.push(
            conflictRule ? conflictRule.flag || conflictRule.label : conflictId,
          );
        }
      }

      if (conflictingRules.length > 0) {
        isEnabled = false;
        disabledReason = `Конфликтует с активным флагом: ${conflictingRules.join(", ")}`;
      }
    }

    // Валидация значения (только если доступно)
    let isValid = true;
    let validationError: string | undefined;

    if (isEnabled) {
      if (!active && rule.required) {
        isValid = false;
        validationError = rule.validator?.errorMessage ?? "Обязательный параметр";
      } else if (active) {
        const validation = validateRuleValue(rule, value);
        isValid = validation.isValid;
        validationError = validation.error;
      }
    }

    evaluations[rule.id] = {
      ruleId: rule.id,
      isEnabled,
      isVisible,
      disabledReason,
      isValid,
      validationError,
      isModified: isValueModified(value, rule.defaultValue),
      active: active && isEnabled,
    };
  }

  return evaluations;
}
