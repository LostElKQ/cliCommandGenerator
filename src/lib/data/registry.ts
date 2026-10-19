import type { CommandDefinition } from "#lib/core/types.js";
import { dockerRunCommand } from "./commands/docker-run.js";
import { ffmpegCommand } from "./commands/ffmpeg.js";
import { gitCommitCommand } from "./commands/git-commit.js";

export const COMMANDS: CommandDefinition[] = [dockerRunCommand, ffmpegCommand, gitCommitCommand];

/**
 * Получить определение команды по ее уникальному идентификатору
 */
export function getCommandById(id: string): CommandDefinition | undefined {
  return COMMANDS.find((cmd) => cmd.id === id);
}

/**
 * Получить команду по умолчанию для первого запуска приложения
 */
export function getDefaultCommand(): CommandDefinition {
  const first = COMMANDS[0];
  if (!first) {
    throw new Error("В реестре нет зарегистрированных команд");
  }
  return first;
}
