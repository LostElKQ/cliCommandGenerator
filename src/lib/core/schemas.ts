import { z } from "zod";
import type { CommandRule, SerializedCommandState } from "./types.js";

export const ArgumentTypeSchema = z.enum([
  "boolean",
  "string",
  "number",
  "select",
  "key-value-map",
  "path",
  "list",
]);

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  description: z.string().optional(),
});

export const KeyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const RuleValidatorSchema = z.object({
  regex: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  errorMessage: z.string().optional(),
});

export const CommandRuleSchema = z.object({
  id: z.string(),
  flag: z.string(),
  shortFlag: z.string().optional(),
  type: ArgumentTypeSchema,
  label: z.string(),
  description: z.string(),
  defaultValue: z.unknown().optional(),
  placeholder: z.string().optional(),
  options: z.array(SelectOptionSchema).optional(),
  dependsOn: z.array(z.string()).optional(),
  conflictsWith: z.array(z.string()).optional(),
  validator: RuleValidatorSchema.optional(),
  docsUrl: z.url().optional(),
  positional: z.boolean().optional(),
  repeatable: z.boolean().optional(),
  required: z.boolean().optional(),
});

export const CommandCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  rules: z.array(CommandRuleSchema),
});

export const CommandDefinitionSchema = z.object({
  id: z.string(),
  baseBinary: z.string(),
  subCommand: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  docsUrl: z.string().url().optional(),
  categories: z.array(CommandCategorySchema),
});

export const ShellTypeSchema = z.enum(["bash", "powershell", "single-line"]);

export const SerializedCommandStateSchema = z.object({
  commandId: z.string(),
  values: z.record(z.string(), z.unknown()),
  shell: ShellTypeSchema.optional(),
});

/**
 * Валидация значения для конкретного правила
 */
export function validateRuleValue(
  rule: CommandRule,
  value: unknown,
): { isValid: false; error: string } | { isValid: true; error?: undefined } {
  if (value === undefined || value === null || value === "") {
    return { isValid: true };
  }

  const { validator, type } = rule;

  switch (type) {
    case "number": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) {
        return {
          isValid: false,
          error: validator?.errorMessage ?? "Значение должно быть числом",
        };
      }
      if (validator?.min !== undefined && num < validator.min) {
        return {
          isValid: false,
          error: validator.errorMessage ?? `Минимальное значение: ${validator.min}`,
        };
      }
      if (validator?.max !== undefined && num > validator.max) {
        return {
          isValid: false,
          error: validator.errorMessage ?? `Максимальное значение: ${validator.max}`,
        };
      }
      break;
    }

    case "string":
    case "path": {
      const str = String(value);
      if (validator?.regex) {
        try {
          const reg = new RegExp(validator.regex);
          if (!reg.test(str)) {
            return {
              isValid: false,
              error: validator.errorMessage ?? "Неверный формат значения",
            };
          }
        } catch {
          // Игнорируем синтаксические ошибки regex конфигурации
        }
      }
      break;
    }

    case "select": {
      if (rule.options && rule.options.length > 0) {
        const optionExists = rule.options.some((opt) => opt.value === value);
        if (!optionExists) {
          return {
            isValid: false,
            error: validator?.errorMessage ?? "Выбрано недопустимое значение",
          };
        }
      }
      break;
    }

    case "key-value-map": {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== "object" || item === null) {
            return { isValid: false, error: "Неверный формат key-value элемента" };
          }
          const { key } = item as { key?: unknown };
          if (!key || String(key).trim() === "") {
            return { isValid: false, error: "Ключ переменной не может быть пустым" };
          }
        }
      }
      break;
    }

    case "list": {
      if (!Array.isArray(value)) {
        return { isValid: false, error: "Значение должно быть списком" };
      }
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        return { isValid: false, error: "Значение должно быть булевым" };
      }
      break;
    }
  }

  return { isValid: true };
}

/**
 * Валидация и парсинг сохраненного состояния
 */
export function parseSerializedState(raw: unknown): SerializedCommandState | null {
  const result = SerializedCommandStateSchema.safeParse(raw);
  if (!result.success) {
    return null;
  }
  return result.data as SerializedCommandState;
}
