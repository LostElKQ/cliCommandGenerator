import type {
  AssembledCommand,
  CommandDefinition,
  CommandRule,
  CommandToken,
  EvaluationMap,
  ShellType,
} from "./types.js";
import { evaluateRules, getAllRules } from "./rules-engine.js";

let tokenIdCounter = 0;
function createTokenId(): string {
  tokenIdCounter += 1;
  return `tok_${tokenIdCounter}`;
}

/**
 * Экранирование аргумента командной строки для указанной оболочки
 */
export function escapeShellArg(arg: string, shell: ShellType): string {
  if (arg === "") {
    return '""';
  }

  // Проверяем, нужны ли кавычки (наличие пробелов или спецсимволов)
  const needsQuotes = /[\s"'`$\\;&|<>*?~!()\[\]{}]/.test(arg);
  if (!needsQuotes) {
    return arg;
  }

  if (shell === "powershell") {
    // В PowerShell кавычки экранируются через backtick или удвоение
    const escaped = arg.replace(/"/g, '`"');
    return `"${escaped}"`;
  }

  // Для Bash/Zsh и single-line
  const escaped = arg.replace(/["\\$`!]/g, "\\$&");
  return `"${escaped}"`;
}

export const ARG_PRIORITY = {
  BOOLEAN: 1,
  OPTION: 2,
  POSITIONAL: 3,
} as const;

export type ArgPriority = (typeof ARG_PRIORITY)[keyof typeof ARG_PRIORITY];

type PreparedArg = {
  errorMessage?: string;
  hasError: boolean;
  priority: ArgPriority;
  rule: CommandRule;
  tokens: CommandToken[];
};

/**
 * Сборщик консольной команды
 */
export function assembleCommand(
  definition: CommandDefinition,
  values: Record<string, unknown>,
  shell: ShellType = "bash",
  evaluations?: EvaluationMap,
): AssembledCommand {
  const evals = evaluations ?? evaluateRules(definition, values);
  const rules = getAllRules(definition);
  const errors: Record<string, string> = {};

  const preparedArgs: PreparedArg[] = [];

  for (const rule of rules) {
    const evaluation = evals[rule.id];
    if (!evaluation || !evaluation.isEnabled) {
      continue;
    }

    if (!evaluation.isValid && evaluation.validationError) {
      errors[rule.id] = evaluation.validationError;
    }

    if (!evaluation.active) {
      continue;
    }

    const val = values[rule.id];
    const ruleHasError = !evaluation.isValid;
    const ruleErrorMsg = evaluation.validationError;

    // 1. Позиционный аргумент
    if (rule.positional) {
      const textVal = String(val ?? "").trim();
      if (textVal.length > 0) {
        preparedArgs.push({
          rule,
          priority: ARG_PRIORITY.POSITIONAL,
          hasError: ruleHasError,
          errorMessage: ruleErrorMsg,
          tokens: [
            {
              id: createTokenId(),
              ruleId: rule.id,
              type: "positional",
              text: escapeShellArg(textVal, shell),
              rawValue: val,
              hasError: ruleHasError,
              errorMessage: ruleErrorMsg,
            },
          ],
        });
      }
      continue;
    }

    // 2. Булев флаг (флаг-переключатель)
    if (rule.type === "boolean") {
      if (val === true) {
        preparedArgs.push({
          rule,
          priority: ARG_PRIORITY.BOOLEAN,
          hasError: ruleHasError,
          errorMessage: ruleErrorMsg,
          tokens: [
            {
              id: createTokenId(),
              ruleId: rule.id,
              type: "flag",
              text: rule.flag,
              isFlag: true,
              rawValue: true,
              hasError: ruleHasError,
              errorMessage: ruleErrorMsg,
            },
          ],
        });
      }
      continue;
    }

    // 3. Key-Value Map (-e KEY=VAL)
    if (rule.type === "key-value-map") {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (!item || typeof item !== "object") {
            continue;
          }
          const k = String(item.key || "").trim();
          if (!k) {
            continue;
          }
          const v = String(item.value ?? "");

          const formattedVal = v ? `${k}=${escapeShellArg(v, shell)}` : k;
          preparedArgs.push({
            rule,
            priority: ARG_PRIORITY.OPTION,
            hasError: ruleHasError,
            errorMessage: ruleErrorMsg,
            tokens: [
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag",
                text: rule.flag,
                isFlag: true,
                hasError: ruleHasError,
              },
              {
                id: createTokenId(),
                type: "whitespace",
                text: " ",
              },
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag-value",
                text: formattedVal,
                rawValue: item,
                hasError: ruleHasError,
                errorMessage: ruleErrorMsg,
              },
            ],
          });
        }
      }
      continue;
    }

    // 4. Список значений (list)
    if (rule.type === "list") {
      if (Array.isArray(val)) {
        for (const item of val) {
          const itemStr = String(item ?? "").trim();
          if (!itemStr) {
            continue;
          }

          preparedArgs.push({
            rule,
            priority: ARG_PRIORITY.OPTION,
            hasError: ruleHasError,
            errorMessage: ruleErrorMsg,
            tokens: [
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag",
                text: rule.flag,
                isFlag: true,
                hasError: ruleHasError,
              },
              {
                id: createTokenId(),
                type: "whitespace",
                text: " ",
              },
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag-value",
                text: escapeShellArg(itemStr, shell),
                rawValue: item,
                hasError: ruleHasError,
                errorMessage: ruleErrorMsg,
              },
            ],
          });
        }
      }
      continue;
    }

    // 5. Обычные опции с аргументом (string, number, select, path)
    const strVal = String(val ?? "").trim();
    if (strVal.length > 0) {
      preparedArgs.push({
        rule,
        priority: ARG_PRIORITY.OPTION,
        hasError: ruleHasError,
        errorMessage: ruleErrorMsg,
        tokens: [
          {
            id: createTokenId(),
            ruleId: rule.id,
            type: "flag",
            text: rule.flag,
            isFlag: true,
            hasError: ruleHasError,
          },
          {
            id: createTokenId(),
            type: "whitespace",
            text: " ",
          },
          {
            id: createTokenId(),
            ruleId: rule.id,
            type: "flag-value",
            text: escapeShellArg(strVal, shell),
            rawValue: val,
            hasError: ruleHasError,
            errorMessage: ruleErrorMsg,
          },
        ],
      });
    }
  }

  // Сортировка аргументов по приоритету:
  // ARG_PRIORITY.BOOLEAN -> ARG_PRIORITY.OPTION -> ARG_PRIORITY.POSITIONAL
  preparedArgs.sort((a, b) => a.priority - b.priority);

  // Формирование токенов заголовка (базовый бинарник и подкоманда)
  const headerTokens: CommandToken[] = [
    {
      id: createTokenId(),
      type: "binary",
      text: definition.baseBinary,
    },
  ];

  if (definition.subCommand) {
    headerTokens.push({
      id: createTokenId(),
      type: "whitespace",
      text: " ",
    });
    headerTokens.push({
      id: createTokenId(),
      type: "subcommand",
      text: definition.subCommand,
    });
  }

  const isMultiline = shell !== "single-line" && preparedArgs.length > 0;
  const lineContinuation = shell === "powershell" ? " `" : " \\";

  const lines: CommandToken[][] = [];
  const allTokens: CommandToken[] = [];

  if (!isMultiline) {
    // Однострочный режим
    const singleLine: CommandToken[] = [...headerTokens];

    for (const arg of preparedArgs) {
      singleLine.push({
        id: createTokenId(),
        type: "whitespace",
        text: " ",
      });
      singleLine.push(...arg.tokens);
    }

    lines.push(singleLine);
    allTokens.push(...singleLine);
  } else {
    // Многострочный режим
    // Первая строка: binary + subcommand + continuation
    const firstLine: CommandToken[] = [...headerTokens];
    firstLine.push({
      id: createTokenId(),
      type: "escape",
      text: lineContinuation,
    });
    lines.push(firstLine);

    preparedArgs.forEach((arg, index) => {
      const isLast = index === preparedArgs.length - 1;
      const currentLine: CommandToken[] = [
        {
          id: createTokenId(),
          type: "whitespace",
          text: "  ", // отступ 2 пробела
        },
        ...arg.tokens,
      ];

      if (!isLast) {
        currentLine.push({
          id: createTokenId(),
          type: "escape",
          text: lineContinuation,
        });
      }

      lines.push(currentLine);
    });

    // Собираем allTokens с разделителями переноса строки
    lines.forEach((line, idx) => {
      allTokens.push(...line);
      if (idx < lines.length - 1) {
        allTokens.push({
          id: createTokenId(),
          type: "whitespace",
          text: "\n",
        });
      }
    });
  }

  const raw = allTokens.map((t) => t.text).join("");

  return {
    raw,
    tokens: allTokens,
    lines,
    hasErrors: Object.keys(errors).length > 0,
    errors,
  };
}
