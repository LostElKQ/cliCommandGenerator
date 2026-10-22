import { expect, test } from "@playwright/test";

test.describe("CLI Command Generator E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Grant clipboard permissions for copy tests
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("loads generator with default command (docker run)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Docker Run/i);

    // Verify terminal header and command binary
    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");
    await expect(terminal).toBeVisible();
    await expect(terminal).toContainText("docker");
    await expect(terminal).toContainText("run");

    // Verify config panel
    const config = page.locator("section[aria-label='Параметры команды']");
    await expect(config).toBeVisible();
    await expect(config.getByLabel("Поиск параметров")).toBeVisible();
  });

  test("switches commands in header", async ({ page }) => {
    await page.goto("/");

    // Switch to Git Commit
    await page.getByRole("button", { name: "Git Commit" }).click();
    await expect(page).toHaveTitle(/Git Commit/i);
    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");
    await expect(terminal).toContainText("git");
    await expect(terminal).toContainText("commit");

    // Switch to FFmpeg
    await page.getByRole("button", { name: "FFmpeg" }).click();
    await expect(page).toHaveTitle(/FFmpeg/i);
    await expect(terminal).toContainText("ffmpeg");
  });

  test("modifies parameters and updates terminal in real time", async ({ page }) => {
    await page.goto("/");
    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");

    // Toggle detach switch via its label
    const detachRule = page.locator('[data-rule-id="detach"]');
    await expect(detachRule).toBeVisible();
    await detachRule.getByText("Выключено").click();

    // Verify -d appears in terminal
    await expect(terminal).toContainText("-d");

    // Fill name input
    const nameRule = page.locator('[data-rule-id="name"]');
    const nameInput = nameRule.locator("input");
    await nameInput.fill("my-custom-app");

    // Verify name appears in terminal
    await expect(terminal).toContainText("--name my-custom-app");
  });

  test("filters parameters using search and clears search", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByLabel("Поиск параметров");

    await searchInput.fill("порт");

    // Only 'Сеть и Порты' category should match
    await expect(page.getByText("Сеть и Порты")).toBeVisible();
    await expect(page.getByText("Тома и Хранилище")).not.toBeVisible();

    // Clear search
    await page.getByRole("button", { name: "Очистить поиск" }).click();
    await expect(page.getByText("Тома и Хранилище")).toBeVisible();
  });

  test("auto-expands category and focuses input when clicking 'Настроить в панели'", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Enable detach flag so -d token appears in terminal
    const detachRule = page.locator('[data-rule-id="detach"]');
    await detachRule.getByText("Выключено").click();

    // 2. Collapse all categories
    await page.getByRole("button", { name: "Свернуть все" }).click();

    // Verify rule input is hidden/unmounted
    await expect(detachRule).not.toBeVisible();

    // 3. Click on the -d token in terminal
    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");
    const token = terminal.getByRole("button", { name: "-d" });
    await token.click();

    // 4. ExplainerBox should appear
    const explainer = page.locator(".card", { hasText: "Текущее значение:" });
    await expect(explainer).toBeVisible();

    // 5. Click 'Настроить в панели'
    const jumpButton = page.getByRole("button", { name: "Настроить в панели" });
    await jumpButton.click();

    // 6. The category containing 'detach' should auto-expand and become visible
    await expect(detachRule).toBeVisible();
  });

  test("switches shell styles (bash, powershell, single-line)", async ({ page }) => {
    await page.goto("/");

    // First add a parameter to have a multi-argument command
    const detachRule = page.locator('[data-rule-id="detach"]');
    await detachRule.getByText("Выключено").click();

    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");

    // Default bash: contains \ continuation
    await expect(terminal).toContainText("\\");

    // Switch to powershell
    await page.getByRole("button", { name: "PowerShell" }).click();
    await expect(terminal).toContainText("`");

    // Switch to single-line
    await page.getByRole("button", { name: "В одну строку" }).click();
    await expect(terminal).not.toContainText("\\");
    await expect(terminal).not.toContainText("`");
  });

  test("copies command to clipboard", async ({ page }) => {
    await page.goto("/");

    const copyButton = page.getByRole("button", {
      name: "Скопировать команду в буфер обмена",
    });
    await copyButton.click();

    await expect(page.getByText("Скопировано!")).toBeVisible();
  });

  test("synchronizes state through URL hash and restores upon direct navigation", async ({
    page,
  }) => {
    await page.goto("/");

    // Modify a parameter: set container name
    const nameRule = page.locator('[data-rule-id="name"]');
    await nameRule.locator("input").fill("e2e-hash-test");

    // Wait for URL hash to update
    await page.waitForFunction(() => location.hash.length > 2);
    const hash = await page.evaluate(() => location.hash);
    expect(hash.startsWith("#")).toBe(true);

    // Open a new page directly with this URL hash
    await page.goto("/" + hash);

    // Verify restored state
    const restoredNameInput = page.locator('[data-rule-id="name"] input');
    await expect(restoredNameInput).toHaveValue("e2e-hash-test");

    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");
    await expect(terminal).toContainText("--name e2e-hash-test");
  });

  test("renders correctly in mobile viewport and supports scroll-to-top button", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Terminal must be above Config panel
    const terminal = page.locator("section[aria-label='Терминал и разбор синтаксиса']");
    const config = page.locator("section[aria-label='Параметры команды']");

    const terminalBox = await terminal.boundingBox();
    const configBox = await config.boundingBox();

    expect(terminalBox).not.toBeNull();
    expect(configBox).not.toBeNull();
    if (terminalBox && configBox) {
      expect(terminalBox.y).toBeLessThan(configBox.y);
    }

    // Scroll down to reveal scroll-to-top button
    await page.evaluate(() => scrollTo(0, 1000));
    await page.waitForTimeout(300);

    const scrollToTopButton = page.getByRole("button", { name: "Наверх" });
    await expect(scrollToTopButton).toBeVisible();

    // Click scroll-to-top button
    await scrollToTopButton.click();
    await page.waitForTimeout(400);

    const scrollYPosition = await page.evaluate(() => scrollY);
    expect(scrollYPosition).toBeLessThan(100);
  });

  test("supports keyboard navigation and input focusing", async ({ page }) => {
    await page.goto("/");

    // Focus search input using Tab or direct focus
    const searchInput = page.getByLabel("Поиск параметров");
    await searchInput.focus();
    await page.keyboard.type("name");

    await expect(page.locator('[data-rule-id="name"]')).toBeVisible();

    // Clear search using keyboard
    await searchInput.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.press("Backspace");

    await expect(page.locator('[data-rule-id="image"]')).toBeVisible();
  });
});
