import { describe, expect, it } from "vitest";
import { mockDockerCommand } from "#lib/core/__tests__/fixtures.js";
import { CommandStore } from "#lib/state/commandStore.svelte.js";

describe("command-store", () => {
  it("initializes store with default values", () => {
    const store = new CommandStore(mockDockerCommand);

    expect(store.definition.id).toBe("docker-run");
    expect(store.shell).toBe("bash");
    expect(store.values["detach"]).toBe(false);
    expect(store.values["image"]).toBe("nginx:alpine");
    expect(store.isModified).toBe(false);
    expect(store.assembled.raw).toContain("docker run");
  });

  it("initializes with provided partial state", () => {
    const store = new CommandStore(mockDockerCommand, {
      shell: "powershell",
      values: {
        detach: true,
        name: "test-container",
      },
    });

    expect(store.shell).toBe("powershell");
    expect(store.values["detach"]).toBe(true);
    expect(store.values["name"]).toBe("test-container");
    expect(store.values["image"]).toBe("nginx:alpine");
    expect(store.isModified).toBe(true);
    expect(store.assembled.raw).toContain("`");
  });

  it("updates value and recalculates assembled command and evaluations", () => {
    const store = new CommandStore(mockDockerCommand);

    store.setValue("detach", true);
    expect(store.values["detach"]).toBe(true);
    expect(store.isModified).toBe(true);
    expect(store.assembled.raw).toContain("-d");

    // Conflicts check: when detach is true, interactive must be disabled
    expect(store.evaluations["interactive"]?.isEnabled).toBe(false);
  });

  it("resets individual values and all values", () => {
    const store = new CommandStore(mockDockerCommand);

    store.setValue("name", "custom-name");
    expect(store.values["name"]).toBe("custom-name");

    store.resetValue("name");
    expect(store.values["name"]).toBe("");

    store.setValue("detach", true);
    store.setValue("name", "another-name");
    store.resetAll();

    expect(store.values["detach"]).toBe(false);
    expect(store.values["name"]).toBe("");
    expect(store.isModified).toBe(false);
  });

  it("filters categories based on search query", () => {
    const store = new CommandStore(mockDockerCommand);

    expect(store.filteredCategories.length).toBe(3);

    store.setSearchQuery("порт");
    expect(store.filteredCategories.length).toBe(1);
    expect(store.filteredCategories[0]?.id).toBe("network");

    store.setSearchQuery("non-existent-search-term-xyz");
    expect(store.filteredCategories.length).toBe(0);

    store.setSearchQuery("");
    expect(store.filteredCategories.length).toBe(3);
  });

  it("manages hovered and selected rule IDs", () => {
    const store = new CommandStore(mockDockerCommand);

    expect(store.hoveredRuleId).toBeUndefined();
    expect(store.selectedRuleId).toBeUndefined();

    store.setHoveredRule("publish");
    expect(store.hoveredRuleId).toBe("publish");

    store.setSelectedRule("detach");
    expect(store.selectedRuleId).toBe("detach");
  });

  it("serializes and loads state correctly", () => {
    const store = new CommandStore(mockDockerCommand);

    store.setValue("detach", true);
    store.setValue("name", "app");
    store.setShell("single-line");

    const serialized = store.serialize();
    expect(serialized.commandId).toBe("docker-run");
    expect(serialized.shell).toBe("single-line");
    expect(serialized.values["detach"]).toBe(true);
    expect(serialized.values["name"]).toBe("app");

    // Create fresh store and load state
    const newStore = new CommandStore(mockDockerCommand);
    newStore.loadState(serialized);

    expect(newStore.shell).toBe("single-line");
    expect(newStore.values["detach"]).toBe(true);
    expect(newStore.values["name"]).toBe("app");
  });
});
