import {
  isAllowedEmbedUrl,
  isValidTrustedDomainEntry,
  normalizeTrustedDomainsInput,
  parseCsvDomains,
} from "@/server/validation";

describe("isValidTrustedDomainEntry", () => {
  it("rejects bare public suffixes that would match whole TLDs", () => {
    expect(isValidTrustedDomainEntry("com")).toBe(false);
    expect(isValidTrustedDomainEntry("uk")).toBe(false);
    expect(isValidTrustedDomainEntry("co")).toBe(false);
  });

  it("accepts multi-label hostnames and localhost", () => {
    expect(isValidTrustedDomainEntry("github.com")).toBe(true);
    expect(isValidTrustedDomainEntry("app.example.com")).toBe(true);
    expect(isValidTrustedDomainEntry("localhost")).toBe(true);
  });
});

describe("parseCsvDomains", () => {
  it("drops bare TLD entries so embed allowlists cannot be widened accidentally", () => {
    expect(parseCsvDomains("com,github.com")).toEqual(["github.com"]);
    expect(parseCsvDomains("com")).toEqual([]);
  });
});

describe("normalizeTrustedDomainsInput", () => {
  it("rejects when any segment is invalid", () => {
    const r = normalizeTrustedDomainsInput("com,github.com");
    expect(r.ok).toBe(false);
  });

  it("dedupes and lowercases valid lists", () => {
    expect(normalizeTrustedDomainsInput("GitHub.COM, github.com")).toEqual({
      ok: true,
      csv: "github.com",
    });
  });
});

describe("isAllowedEmbedUrl", () => {
  it("does not allow arbitrary hosts when allowlist was only a TLD (filtered to empty)", () => {
    expect(isAllowedEmbedUrl("https://evil.com", parseCsvDomains("com"))).toBe(false);
  });
});
