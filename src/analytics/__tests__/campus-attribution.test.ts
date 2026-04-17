import {
  CAMPUS_ATTRIBUTION_STORAGE_KEY,
  parseCampusAttributionFromSearchParams,
} from "@/analytics/campus-attribution";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
}

describe("parseCampusAttributionFromSearchParams", () => {
  it("returns slug when campaign matches and utm_source has slug_suffix shape", () => {
    const p = params(
      "utm_campaign=be_campus_2026&utm_source=uw-madison_email&utm_medium=social"
    );
    expect(parseCampusAttributionFromSearchParams(p)).toEqual({ slug: "uw-madison" });
  });

  it("returns null when utm_campaign is wrong", () => {
    const p = params("utm_campaign=other&utm_source=uw-madison_email");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("returns null when utm_campaign is missing", () => {
    const p = params("utm_source=uw-madison_email");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("returns null when utm_source is missing", () => {
    const p = params("utm_campaign=be_campus_2026");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("returns null when utm_source has no underscore", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=uwmadison");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("returns null when underscore is first character (empty candidate)", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=_channel");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("accepts empty suffix after first underscore (slug only before _)", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=uw-madison_");
    expect(parseCampusAttributionFromSearchParams(p)).toEqual({ slug: "uw-madison" });
  });

  it("returns null for invalid slug characters in candidate", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=bad..slug_email");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("returns null when candidate has spaces", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=bad%20slug_x");
    expect(parseCampusAttributionFromSearchParams(p)).toBeNull();
  });

  it("normalizes candidate to lowercase", () => {
    const p = params("utm_campaign=be_campus_2026&utm_source=UW-Madison_Email");
    expect(parseCampusAttributionFromSearchParams(p)).toEqual({ slug: "uw-madison" });
  });
});

describe("captureCampusAttributionFromUrl (first-touch)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-01T15:30:00.000Z").getTime());
    delete (globalThis as { window?: unknown }).window;
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (globalThis as { window?: unknown }).window;
  });

  function mountWindow(search: string, storage: Record<string, string>) {
    const localStorage = {
      getItem: (key: string) =>
        Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    };
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage,
        location: { search },
        dispatchEvent: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });
  }

  it("writes slug and capturedAt when URL matches and storage is empty", async () => {
    const storage: Record<string, string> = {};
    mountWindow("?utm_campaign=be_campus_2026&utm_source=uiuc_newsletter", storage);
    const { captureCampusAttributionFromUrl, readCampusAttribution } = await import(
      "@/analytics/campus-attribution"
    );
    captureCampusAttributionFromUrl();
    const raw = storage[CAMPUS_ATTRIBUTION_STORAGE_KEY];
    expect(raw).toBeDefined();
    expect(JSON.parse(raw!)).toEqual({
      slug: "uiuc",
      capturedAt: "2026-03-01T15:30:00.000Z",
    });
    expect(readCampusAttribution()).toEqual({
      slug: "uiuc",
      capturedAt: "2026-03-01T15:30:00.000Z",
    });
  });

  it("does not overwrite when valid attribution is already stored (first-touch)", async () => {
    const storage: Record<string, string> = {
      [CAMPUS_ATTRIBUTION_STORAGE_KEY]: JSON.stringify({
        slug: "existing-uni",
        capturedAt: "2025-12-01T00:00:00.000Z",
      }),
    };
    mountWindow("?utm_campaign=be_campus_2026&utm_source=new-uni_email", storage);
    const { captureCampusAttributionFromUrl } = await import("@/analytics/campus-attribution");
    captureCampusAttributionFromUrl();
    const parsed = JSON.parse(storage[CAMPUS_ATTRIBUTION_STORAGE_KEY]!);
    expect(parsed.slug).toBe("existing-uni");
    expect(parsed.capturedAt).toBe("2025-12-01T00:00:00.000Z");
  });

  it("does not write when parse returns null", async () => {
    const storage: Record<string, string> = {};
    mountWindow("?utm_campaign=be_campus_2026&utm_source=nounderscore", storage);
    const { captureCampusAttributionFromUrl } = await import("@/analytics/campus-attribution");
    captureCampusAttributionFromUrl();
    expect(storage[CAMPUS_ATTRIBUTION_STORAGE_KEY]).toBeUndefined();
  });
});
