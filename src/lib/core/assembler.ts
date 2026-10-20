import type {
  AssembledCommand,
  CommandDefinition,
  CommandRule,
  CommandToken,
  EvaluationMap,
  ShellType,
} from "./types.js";
import { evaluateRules, getAllRules } from "./rulesEngine.js";

function createTokenGenerator(): () => string {
  let counter = 0;
  return () => {
    counter += 1;
    return `tok_${counter}`;
  };
}
const createTokenId = createTokenGenerator();

/**
Экранирование аргумента командной строки для указанной оболочки
*/
export function escapeShellArgument(argument: string, shell: ShellType): string {
  if (argument === "") {
    return '""';
  }

  // Проверяем, нужны ли кавычки (наличие пробелов или спецсимволов)
  const requiresQuotes = /[\s"'`$\\;&|<>*?~!()\[\]{}]/.test(argument);
  if (!requiresQuotes) {
    return argument;
  }

  if (shell === "powershell") {
    // В PowerShell кавычки экранируются через backtick или удвоение
    const escaped = argument.replaceAll('"', '`"');
    return `"${escaped}"`;
  }

  // Для Bash/Zsh и single-line
  const escaped = argument.replaceAll(/["\\$`!]/g, String.raw`\$&`);
  return `"${escaped}"`;
}

export const ARG_PRIORITY = {
  BOOLEAN: 1,
  OPTION: 2,
  POSITIONAL: 3,
} as const;

export type ArgumentPriority = (typeof ARG_PRIORITY)[keyof typeof ARG_PRIORITY];

type PreparedArgument = {
  errorMessage?: string;
  hasError: boolean;
  priority: ArgumentPriority;
  rule: CommandRule;
  tokens: CommandToken[];
};

/**
Сборщик консольной команды
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

  const preparedArguments: PreparedArgument[] = [];

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

    const value = values[rule.id];
    const hasRuleError = !evaluation.isValid;
    const ruleErrorMessage = evaluation.validationError;

    // 1. Позиционный аргумент
    if (rule.positional) {
      const textValue = String(value ?? "").trim();
      if (textValue.length > 0) {
        preparedArguments.push({
          rule,
          priority: ARG_PRIORITY.POSITIONAL,
          hasError: hasRuleError,
          errorMessage: ruleErrorMessage,
          tokens: [
            {
              id: createTokenId(),
              ruleId: rule.id,
              type: "positional",
              text: escapeShellArgument(textValue, shell),
              rawValue: value,
              hasError: hasRuleError,
              errorMessage: ruleErrorMessage,
            },
          ],
        });
      }
      continue;
    }

    // 2. Булев флаг (флаг-переключатель)
    if (rule.type === "boolean") {
      if (value === true) {
        preparedArguments.push({
          rule,
          priority: ARG_PRIORITY.BOOLEAN,
          hasError: hasRuleError,
          errorMessage: ruleErrorMessage,
          tokens: [
            {
              id: createTokenId(),
              ruleId: rule.id,
              type: "flag",
              text: rule.flag,
              isFlag: true,
              rawValue: true,
              hasError: hasRuleError,
              errorMessage: ruleErrorMessage,
            },
          ],
        });
      }
      continue;
    }

    // 3. Key-Value Map (-e KEY=VAL)
    if (rule.type === "key-value-map") {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (!item || typeof item !== "object") {
            continue;
          }
          const k = String(item.key || "").trim();
          if (!k) {
            continue;
          }
          const v = String(item.value ?? "");

          const formattedValue = v ? `${k}=${escapeShellArgument(v, shell)}` : k;
          preparedArguments.push({
            rule,
            priority: ARG_PRIORITY.OPTION,
            hasError: hasRuleError,
            errorMessage: ruleErrorMessage,
            tokens: [
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag",
                text: rule.flag,
                isFlag: true,
                hasError: hasRuleError,
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
                text: formattedValue,
                rawValue: item,
                hasError: hasRuleError,
                errorMessage: ruleErrorMessage,
              },
            ],
          });
        }
      }
      continue;
    }

    // 4. Список значений (list)
    if (rule.type === "list") {
      if (Array.isArray(value)) {
        for (const item of value) {
          const itemString = String(item ?? "").trim();
          if (!itemString) {
            continue;
          }

          preparedArguments.push({
            rule,
            priority: ARG_PRIORITY.OPTION,
            hasError: hasRuleError,
            errorMessage: ruleErrorMessage,
            tokens: [
              {
                id: createTokenId(),
                ruleId: rule.id,
                type: "flag",
                text: rule.flag,
                isFlag: true,
                hasError: hasRuleError,
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
                text: escapeShellArgument(itemString, shell),
                rawValue: item,
                hasError: hasRuleError,
                errorMessage: ruleErrorMessage,
              },
            ],
          });
        }
      }
      continue;
    }

    // 5. Обычные опции с аргументом (string, number, select, path)
    const stringValue = String(value ?? "").trim();
    if (stringValue.length > 0) {
      preparedArguments.push({
        rule,
        priority: ARG_PRIORITY.OPTION,
        hasError: hasRuleError,
        errorMessage: ruleErrorMessage,
        tokens: [
          {
            id: createTokenId(),
            ruleId: rule.id,
            type: "flag",
            text: rule.flag,
            isFlag: true,
            hasError: hasRuleError,
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
            text: escapeShellArgument(stringValue, shell),
            rawValue: value,
            hasError: hasRuleError,
            errorMessage: ruleErrorMessage,
          },
        ],
      });
    }
  }

  // Сортировка аргументов по приоритету:
  // ARG_PRIORITY.BOOLEAN -> ARG_PRIORITY.OPTION -> ARG_PRIORITY.POSITIONAL
  preparedArguments.sort((a, b) => a.priority - b.priority);

  // Формирование токенов заголовка (базовый бинарник и подкоманда)
  const headerTokens: CommandToken[] = [
    {
      id: createTokenId(),
      type: "binary",
      text: definition.baseBinary,
    },
  ];

  if (definition.subCommand) {
    headerTokens.push(
      {
        id: createTokenId(),
        type: "whitespace",
        text: " ",
      },
      {
        id: createTokenId(),
        type: "subcommand",
        text: definition.subCommand,
      },
    );
  }

  const isMultiline = shell !== "single-line" && preparedArguments.length > 0;
  const lineContinuation = shell === "powershell" ? " `" : " \\";

  const lines: CommandToken[][] = [];
  const allTokens: CommandToken[] = [];

  if (isMultiline) {
    // Многострочный режим
    // Первая строка: binary + subcommand + continuation
    const firstLine: CommandToken[] = [
      ...headerTokens,
      {
        id: createTokenId(),
        type: "escape",
        text: lineContinuation,
      },
    ];
    lines.push(firstLine);

    for (const [index, argument] of preparedArguments.entries()) {
      const isLast = index === preparedArguments.length - 1;
      const currentLine: CommandToken[] = [
        {
          id: createTokenId(),
          type: "whitespace",
          text: "  ", // отступ 2 пробела
        },
        ...argument.tokens,
      ];

      if (!isLast) {
        currentLine.push({
          id: createTokenId(),
          type: "escape",
          text: lineContinuation,
        });
      }

      lines.push(currentLine);
    }

    // Собираем allTokens с разделителями переноса строки
    for (const [index, line] of lines.entries()) {
      allTokens.push(...line);
      if (index < lines.length - 1) {
        allTokens.push({
          id: createTokenId(),
          type: "whitespace",
          text: "\n",
        });
      }
    }
  } else {
    // Однострочный режим
    const singleLine: CommandToken[] = [...headerTokens];

    for (const argument of preparedArguments) {
      singleLine.push(
        {
          id: createTokenId(),
          type: "whitespace",
          text: " ",
        },
        ...argument.tokens,
      );
    }

    lines.push(singleLine);
    allTokens.push(...singleLine);
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
