import type { CommandDefinition } from "#lib/core/types.js";

export const mockDockerCommand: CommandDefinition = {
  id: "docker-run",
  baseBinary: "docker",
  subCommand: "run",
  title: "Docker Run",
  summary: "Запуск контейнера из образа",
  categories: [
    {
      id: "general",
      title: "Основные параметры",
      rules: [
        {
          id: "detach",
          flag: "-d",
          shortFlag: "-d",
          type: "boolean",
          label: "Фоновый режим (Detach)",
          description: "Запустить контейнер в фоновом режиме",
          defaultValue: false,
        },
        {
          id: "interactive",
          flag: "-i",
          type: "boolean",
          label: "Интерактивный режим",
          description: "Оставить STDIN открытым",
          defaultValue: false,
          conflictsWith: ["detach"],
        },
        {
          id: "name",
          flag: "--name",
          type: "string",
          label: "Имя контейнера",
          description: "Присвоить контейнеру имя",
          placeholder: "my-container",
          validator: {
            regex: "^[a-zA-Z0-9_-]+$",
            errorMessage: "Имя может содержать только буквы, цифры, дефис и подчеркивание",
          },
        },
        {
          id: "image",
          flag: "",
          type: "string",
          label: "Имя образа",
          description: "Образ Docker для запуска",
          positional: true,
          required: true,
          defaultValue: "nginx:alpine",
        },
      ],
    },
    {
      id: "network",
      title: "Сеть и Порты",
      rules: [
        {
          id: "publish",
          flag: "-p",
          type: "string",
          label: "Проброс порта",
          description: "Формат: [хост:]контейнер",
          placeholder: "8080:80",
          validator: {
            regex: "^([0-9]{1,5}:)?[0-9]{1,5}$",
            errorMessage: "Порт должен быть в формате [host:]container (1-65535)",
          },
        },
        {
          id: "network",
          flag: "--network",
          type: "select",
          label: "Сетевой режим",
          description: "Подключение к указанной сети",
          defaultValue: "bridge",
          options: [
            { label: "Bridge (По умолчанию)", value: "bridge" },
            { label: "Host", value: "host" },
            { label: "None", value: "none" },
          ],
        },
        {
          id: "ip",
          flag: "--ip",
          type: "string",
          label: "Статический IP",
          description: "Назначить статический IPv4 адрес",
          dependsOn: ["network"],
        },
      ],
    },
    {
      id: "env",
      title: "Переменные окружения",
      rules: [
        {
          id: "environment",
          flag: "-e",
          type: "key-value-map",
          label: "Переменные окружения",
          description: "Установить ENV переменные (-e KEY=VAL)",
          defaultValue: [],
        },
      ],
    },
  ],
};
