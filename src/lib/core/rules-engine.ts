import type { CommandDefinition, CommandRule, EvaluationMap } from "./types.js";
import { validateRuleValue } from "./schemas.js";

/**
 * Получить плоский список всех правил команды
 */
export function getAllRules(definition: CommandDefinition): CommandRule[] {
  return definition.categories.flatMap((cat) => cat.rules);
}

/**
 * Найти правило по его идентификатору
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
 * Определяет, считается ли правило "активным" (включенным пользователем)
 */
export function isRuleActive(rule: CommandRule, value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  switch (rule.type) {
    case "boolean":
      return value === true;

    case "string":
    case "path":
      return typeof value === "string" && value.trim().length > 0;

    case "number":
      if (typeof value === "number") {
        return !Number.isNaN(value);
      }
      return typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Number(value));

    case "select":
      return value !== "" && value !== undefined && value !== null;

    case "key-value-map":
      if (!Array.isArray(value)) return false;
      return value.some(
        (kv) => kv && typeof kv === "object" && String(kv.key || "").trim().length > 0,
      );

    case "list":
      if (!Array.isArray(value)) return false;
      return value.length > 0;

    default:
      return Boolean(value);
  }
}

/**
 * Сравнение значения с дефолтным
 */
export function isValueModified(value: unknown, defaultValue: unknown): boolean {
  if (value === defaultValue) return false;
  if (
    (value === undefined || value === null || value === "") &&
    (defaultValue === undefined || defaultValue === null || defaultValue === "")
  ) {
    return false;
  }
  return JSON.stringify(value) !== JSON.stringify(defaultValue);
}

/**
 * Получить значения по умолчанию для всех правил команды
 */
export function getDefaultValues(definition: CommandDefinition): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const rules = getAllRules(definition);

  for (const rule of rules) {
    if (rule.defaultValue !== undefined) {
      result[rule.id] = JSON.parse(JSON.stringify(rule.defaultValue));
    } else {
      switch (rule.type) {
        case "boolean":
          result[rule.id] = false;
          break;
        case "number":
          result[rule.id] = undefined;
          break;
        case "select":
          result[rule.id] = rule.options?.[0]?.value ?? "";
          break;
        case "key-value-map":
        case "list":
          result[rule.id] = [];
          break;
        default:
          result[rule.id] = "";
          break;
      }
    }
  }

  return result;
}

/**
 * Вычисляет состояние доступности, видимости и валидности для всех правил
 */
export function evaluateRules(
  definition: CommandDefinition,
  values: Record<string, unknown>,
): EvaluationMap {
  const rules = getAllRules(definition);
  const rulesById = new Map<string, CommandRule>(rules.map((r) => [r.id, r]));
  const evaluations: EvaluationMap = {};

  // 1-й проход: вычисление базовой активности каждого правила
  const activeStatus = new Map<string, boolean>();
  for (const rule of rules) {
    const val = values[rule.id];
    activeStatus.set(rule.id, isRuleActive(rule, val));
  }

  // 2-й проход: зависимости, конфликты и валидация
  for (const rule of rules) {
    const val = values[rule.id];
    const active = activeStatus.get(rule.id) ?? false;
    let isEnabled = true;
    let isVisible = true;
    let disabledReason: string | undefined;

    // Проверка dependsOn
    if (rule.dependsOn && rule.dependsOn.length > 0) {
      const missingDependencies: string[] = [];
      for (const depId of rule.dependsOn) {
        const depRule = rulesById.get(depId);
        const depActive = activeStatus.get(depId) ?? false;
        if (!depActive) {
          missingDependencies.push(depRule ? depRule.flag || depRule.label : depId);
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
        if (conflictActive) {
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
      if (rule.required && !active) {
        isValid = false;
        validationError = rule.validator?.errorMessage ?? "Обязательный параметр";
      } else if (active) {
        const validation = validateRuleValue(rule, val);
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
      isModified: isValueModified(val, rule.defaultValue),
      active: active && isEnabled,
    };
  }

  return evaluations;
}
