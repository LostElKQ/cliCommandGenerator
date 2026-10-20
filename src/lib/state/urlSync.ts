import LZString from "lz-string";
import { parseSerializedState } from "#lib/core/schemas.js";
import type { SerializedCommandState } from "#lib/core/types.js";

export type UrlSyncResult =
  | { data: SerializedCommandState; error?: undefined; type: "success" }
  | { data?: undefined; error: string; type: "error" }
  | { data?: undefined; error?: undefined; type: "empty" };

const HASH_KEY = "c=";

/**
Сжатие объекта состояния команды в URI-encoded строку
*/
export function encodeStateToHash(state: SerializedCommandState): string {
  const json = JSON.stringify(state);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${HASH_KEY}${compressed}`;
}

/**
Извлечение сжатой строки из hash или query фрагмента
*/
export function extractPayloadFromFragment(fragment: string): string | undefined {
  const trimmed =
    fragment.startsWith("#") || fragment.startsWith("?") ? fragment.slice(1) : fragment;

  if (!trimmed) {
    return undefined;
  }

  // Если это формат "c=<compressed>"
  if (trimmed.startsWith(HASH_KEY)) {
    return trimmed.slice(HASH_KEY.length);
  }

  // Попытка найти параметр c= в URLSearchParams
  const parameters = new URLSearchParams(trimmed);
  const parameterValue = parameters.get("c");
  if (parameterValue) {
    return parameterValue;
  }

  // Либо фрагмент передан как чистая сжатая строка
  return trimmed;
}

/**
Декодирование и валидация состояния команды из URL
*/
export function decodeStateFromHash(fragment: string): UrlSyncResult {
  const payload = extractPayloadFromFragment(fragment);
  if (!payload || payload.trim() === "") {
    return { type: "empty" };
  }

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(payload);
    if (!decompressed) {
      return {
        error: "Не удалось распаковать данные из URL",
        type: "error",
      };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(decompressed);
    } catch {
      return {
        error: "Некорректный JSON в данных URL",
        type: "error",
      };
    }

    const validated = parseSerializedState(parsedJson);
    if (!validated) {
      return {
        error: "Структура состояния не соответствует валидной схеме команды",
        type: "error",
      };
    }

    return {
      data: validated,
      type: "success",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Неизвестная ошибка разбора URL",
      type: "error",
    };
  }
}

/**
Формирование полной ссылки для шаринга
*/
export function buildShareUrl(currentUrl: string, state: SerializedCommandState): string {
  const encoded = encodeStateToHash(state);
  const url = new URL(currentUrl);
  url.hash = encoded;
  return url.href;
}

/**
Плавное обновление URL hash в браузере без добавления лишних записей в историю
*/
export function updateBrowserUrlHash(state: SerializedCommandState): void {
  if (typeof window === "undefined") {
    return;
  }

  const encoded = encodeStateToHash(state);
  const newUrl = `${location.pathname}${location.search}#${encoded}`;
  history.replaceState(undefined, "", newUrl);
}
