import LZString from "lz-string";
import { describe, expect, it } from "vitest";
import type { SerializedCommandState } from "#lib/core/types.js";
import {
  buildShareUrl,
  decodeStateFromHash,
  encodeStateToHash,
  extractPayloadFromFragment,
} from "#lib/state/url-sync.js";

describe("url-sync", () => {
  const sampleState: SerializedCommandState = {
    commandId: "docker-run",
    shell: "bash",
    values: {
      detach: true,
      image: "redis:alpine",
      name: "cache",
      publish: "6379:6379",
    },
  };

  it("encodes and decodes state in a lossless roundtrip", () => {
    const encoded = encodeStateToHash(sampleState);
    expect(encoded.startsWith("c=")).toBe(true);

    const result = decodeStateFromHash(encoded);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.data).toEqual(sampleState);
    }
  });

  it("handles fragments with leading # or ?", () => {
    const encoded = encodeStateToHash(sampleState);

    const hashResult = decodeStateFromHash(`#${encoded}`);
    expect(hashResult.type).toBe("success");
    if (hashResult.type === "success") {
      expect(hashResult.data).toEqual(sampleState);
    }

    const queryResult = decodeStateFromHash(`?${encoded}`);
    expect(queryResult.type).toBe("success");
    if (queryResult.type === "success") {
      expect(queryResult.data).toEqual(sampleState);
    }
  });

  it("handles empty or blank fragment with empty result", () => {
    expect(decodeStateFromHash("")).toEqual({ type: "empty" });
    expect(decodeStateFromHash("#")).toEqual({ type: "empty" });
    expect(decodeStateFromHash("?")).toEqual({ type: "empty" });
    expect(decodeStateFromHash("#c=")).toEqual({ type: "empty" });
  });

  it("returns error result for corrupted or invalid payload", () => {
    const result = decodeStateFromHash("#c=not-valid-lz-string-data-@@@$$$");
    expect(result.type).toBe("error");
    if (result.type === "error") {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error result when decoded JSON does not match Zod schema", () => {
    // Valid LZ compression of invalid schema data (missing commandId and invalid values)
    const invalidData = { foo: "bar" };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(invalidData));
    const result = decodeStateFromHash(`c=${compressed}`);

    expect(result.type).toBe("error");
    if (result.type === "error") {
      expect(result.error).toContain("схеме");
    }
  });

  it("builds a complete share URL preserving origin and path", () => {
    const shareUrl = buildShareUrl("https://example.com/app", sampleState);
    const parsed = new URL(shareUrl);

    expect(parsed.origin).toBe("https://example.com");
    expect(parsed.pathname).toBe("/app");
    expect(parsed.hash.startsWith("#c=")).toBe(true);

    const decoded = decodeStateFromHash(parsed.hash);
    expect(decoded.type).toBe("success");
    if (decoded.type === "success") {
      expect(decoded.data).toEqual(sampleState);
    }
  });

  it("extracts payload correctly from various formats", () => {
    expect(extractPayloadFromFragment("")).toBeNull();
    expect(extractPayloadFromFragment("#c=abc")).toBe("abc");
    expect(extractPayloadFromFragment("?c=abc")).toBe("abc");
    expect(extractPayloadFromFragment("c=abc")).toBe("abc");
    expect(extractPayloadFromFragment("rawpayload")).toBe("rawpayload");
  });
});
