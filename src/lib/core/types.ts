export type ArgumentType =
  | "boolean" // Флаг-переключатель (--rm, -d)
  | "string" // Текстовая строка (имя, хост)
  | "number" // Числовое значение (порты, лимиты памяти, битрейт)
  | "select" // Фиксированный enum (выбор алгоритма, кодека)
  | "key-value-map" // Набор пар ключ-значение (ENV-переменные: -e KEY=VAL)
  | "path" // Локальный путь или том монтирования (-v /host:/container)
  | "list"; // Повторяемый список аргументов

export type SelectOption = {
  description?: string;
  label: string;
  value: string | number;
};

export type KeyValuePair = {
  key: string;
  value: string;
};

export type RuleValidator = {
  errorMessage?: string;
  max?: number;
  min?: number;
  regex?: string;
};

export type CommandRule = {
  conflictsWith?: string[]; // ID флагов, взаимоисключающих этот
  defaultValue?: unknown;
  dependsOn?: string[]; // ID флагов, без которых данный флаг неактивен
  description: string;
  docsUrl?: string; // Ссылка на документацию флага
  flag: string; // Например, "--publish" или "-p"
  id: string;
  label: string;
  options?: SelectOption[]; // Для type: 'select'
  placeholder?: string;
  positional?: boolean; // Позиционный аргумент (без флага в строке)
  repeatable?: boolean; // Флаг может повторяться несколько раз
  required?: boolean; // Обязательный параметр (команда не валидна без него)
  shortFlag?: string; // Например, "-p"
  type: ArgumentType;
  validator?: RuleValidator;
};

export type CommandCategory = {
  description?: string;
  id: string;
  rules: CommandRule[];
  title: string;
};

export type CommandDefinition = {
  baseBinary: string; // Например, "docker"
  categories: CommandCategory[];
  docsUrl?: string;
  id: string;
  subCommand?: string; // Например, "run"
  summary: string;
  title: string;
};

export type ShellType = "bash" | "powershell" | "single-line";

export type TokenType =
  | "binary"
  | "subcommand"
  | "flag"
  | "flag-value"
  | "positional"
  | "escape"
  | "whitespace"
  | "comment";

export type CommandToken = {
  errorMessage?: string;
  hasError?: boolean;
  id: string;
  isFlag?: boolean;
  rawValue?: unknown;
  ruleId?: string; // ID соответствующего правила (для подсветки в UI)
  text: string;
  type: TokenType;
};

export type AssembledCommand = {
  errors: Record<string, string>; // ruleId -> сообщение об ошибке
  hasErrors: boolean;
  lines: CommandToken[][]; // Токены, сгруппированные по строкам
  raw: string; // Готовая строка команды для копирования в буфер
  tokens: CommandToken[]; // Линейный список всех токенов
};

export type RuleEvaluation = {
  active: boolean; // Считается ли правило активным (включено/заполнено)
  disabledReason?: string;
  isEnabled: boolean; // Доступен ли контрол (false если конфликтует)
  isModified: boolean; // Отличается ли от defaultValue
  isValid: boolean;
  isVisible: boolean; // Видим ли контрол (false если dependsOn не выполнен)
  ruleId: string;
  validationError?: string;
};

export type EvaluationMap = Record<string, RuleEvaluation>;

export type SerializedCommandState = {
  commandId: string;
  shell?: ShellType;
  values: Record<string, unknown>;
};
