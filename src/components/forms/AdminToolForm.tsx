"use client";

import { useState } from "react";
import type { Tool, ToolKind } from "@/types";

interface AdminToolFormProps {
  tool?: Tool | null;
  onSave: () => void;
  onCancel: () => void;
}

function buildInitialForm(tool?: Tool | null) {
  const initialCategories = tool?.categories?.length
    ? tool.categories.join(", ")
    : tool?.category ?? "";
  if (tool) {
    const kind: ToolKind = tool.tool_kind === "web" ? "web" : "download";
    return {
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      short_description: tool.short_description,
      categories: initialCategories,
      icon: tool.icon,
      tool_kind: kind,
      delivery_mode: tool.delivery_mode || "download",
      download_url: tool.download_url || "",
      web_url: tool.web_url || "",
      embed_allowed: Boolean(tool.embed_allowed),
      embed_url: tool.embed_url || "",
      runtime_supported: Boolean(tool.runtime_supported),
      runtime_entrypoint: tool.runtime_entrypoint || "",
      sandbox_level: tool.sandbox_level || "strict",
      trusted_domains: tool.trusted_domains || "",
      vendor: tool.vendor || "",
      privacy_summary: tool.privacy_summary || "",
      data_handling: tool.data_handling || "medium",
      review_notes: tool.review_notes || "",
      last_reviewed_at: tool.last_reviewed_at || "",
      github_url: tool.github_url,
      platform: tool.platform,
      app_store_url: tool.app_store_url || "",
      play_store_url: tool.play_store_url || "",
    };
  }
  return {
    name: "",
    slug: "",
    description: "",
    short_description: "",
    categories: "",
    icon: "🔧",
    tool_kind: "download" as ToolKind,
    delivery_mode: "download",
    download_url: "",
    web_url: "",
    embed_allowed: false,
    embed_url: "",
    runtime_supported: false,
    runtime_entrypoint: "",
    sandbox_level: "strict",
    trusted_domains: "",
    vendor: "",
    privacy_summary: "",
    data_handling: "medium",
    review_notes: "",
    last_reviewed_at: "",
    github_url: "",
    platform: "windows",
    app_store_url: "",
    play_store_url: "",
  };
}

export default function AdminToolForm({ tool, onSave, onCancel }: AdminToolFormProps) {
  const isEdit = !!tool;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => buildInitialForm(tool));

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "embed_allowed" || name === "runtime_supported"
          ? checked
          : value,
    }));
  }

  function autoSlug() {
    if (!isEdit) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit ? `/api/tools/${tool!.slug}` : "/api/tools";
      const method = isEdit ? "PUT" : "POST";
      const categories = form.categories
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save tool");
        setSaving(false);
        return;
      }
      onSave();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-card-border text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/30 transition-colors";

  const labelClass = "block text-sm font-medium text-foreground/70 mb-1.5";
  const requiredMark = <span className="text-accent-amber">*</span>;

  const hasStoreDraft =
    String(form.app_store_url ?? "").trim().length > 0 ||
    String(form.play_store_url ?? "").trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-foreground">
        {isEdit ? "Edit Tool" : "Add New Tool"}
      </h2>
      <p className="text-xs text-foreground/45">
        <span className="text-accent-amber">*</span> Required field
      </p>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Name {requiredMark}</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={autoSlug}
            placeholder="PDF Forge"
            className={inputClass}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass}>Slug {requiredMark}</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="pdf-forge"
            className={inputClass}
            required
            disabled={isEdit}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Description {requiredMark}</label>
        <input
          type="text"
          name="short_description"
          value={form.short_description}
          onChange={handleChange}
          placeholder="A brief one-liner about the tool"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Full Description {requiredMark}</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed description of what the tool does..."
          className={`${inputClass} h-28 resize-y`}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Tool type</label>
          <select
            name="tool_kind"
            value={form.tool_kind}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="download">Release / install link (non-web default)</option>
            <option value="web">Web app (runs in browser)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Delivery mode</label>
          <select
            name="delivery_mode"
            value={form.delivery_mode}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="redirect">A: Redirect to trusted web tool</option>
            <option value="embedded">B: Embed in app</option>
            <option value="browserRuntime">C: Browser runtime beta</option>
            <option value="download">Download fallback</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Categories {requiredMark}</label>
          <input
            type="text"
            name="categories"
            value={form.categories}
            onChange={handleChange}
            placeholder="pdf, converter, mobile, utility"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Icon (emoji or image URL)</label>
          <input
            type="text"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            placeholder="🔧 or https://example.com/icon.png"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Platform</label>
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="web">Web browser</option>
            <option value="ios">iOS (App Store)</option>
            <option value="android">Android (Google Play)</option>
            <option value="ios,android">iOS & Android</option>
            <option value="windows">Windows</option>
            <option value="mac">Mac</option>
            <option value="windows,mac">Windows & Mac</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {form.tool_kind === "download" ? (
          <div>
            <label className={labelClass}>
              Download URL {!hasStoreDraft ? requiredMark : <span className="text-foreground/30">(optional)</span>}
            </label>
            <input
              type="url"
              name="download_url"
              value={form.download_url}
              onChange={handleChange}
              placeholder="https://… direct or release link (optional if store links below)"
              className={inputClass}
              required={!hasStoreDraft}
            />
            {hasStoreDraft && (
              <p className="mt-1 text-xs text-foreground/40">
                Optional because at least one store URL is provided.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className={labelClass}>Web app URL {requiredMark}</label>
            <input
              type="url"
              name="web_url"
              value={form.web_url}
              onChange={handleChange}
              placeholder="https://… where the app opens"
              className={inputClass}
              required
            />
          </div>
        )}
        <div>
          <label className={labelClass}>
            Public project link <span className="text-foreground/30">(optional)</span>
          </label>
          <input
            type="url"
            name="github_url"
            value={form.github_url}
            onChange={handleChange}
            placeholder="Usually GitHub — https://…"
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-white/[0.02] p-4 space-y-4">
        <p className="text-sm font-medium text-foreground/80">App Store &amp; Google Play</p>
        <p className="text-xs text-foreground/45 -mt-2">
          Optional. Include <span className="font-mono text-foreground/55">mobile</span> in categories to group
          listings. Visitors pick Apple or Android when both links exist; each opens the store off-site.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Apple App Store URL</label>
            <input
              type="url"
              name="app_store_url"
              value={form.app_store_url}
              onChange={handleChange}
              placeholder="https://apps.apple.com/…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Google Play URL</label>
            <input
              type="url"
              name="play_store_url"
              value={form.play_store_url}
              onChange={handleChange}
              placeholder="https://play.google.com/…"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Embed URL</label>
          <input
            type="url"
            name="embed_url"
            value={form.embed_url}
            onChange={handleChange}
            placeholder="https://... embeddable endpoint"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Trusted domains (comma-separated)</label>
          <input
            type="text"
            name="trusted_domains"
            value={form.trusted_domains}
            onChange={handleChange}
            placeholder="example.com,cdn.example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Runtime entrypoint</label>
          <input
            type="text"
            name="runtime_entrypoint"
            value={form.runtime_entrypoint}
            onChange={handleChange}
            placeholder="/runtime/main.js"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sandbox level</label>
          <select
            name="sandbox_level"
            value={form.sandbox_level}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="strict">Strict</option>
            <option value="standard">Standard</option>
            <option value="trusted">Trusted</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            name="embed_allowed"
            checked={form.embed_allowed}
            onChange={handleChange}
          />
          Embed allowed
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            name="runtime_supported"
            checked={form.runtime_supported}
            onChange={handleChange}
          />
          Runtime supported
        </label>
        <div>
          <label className={labelClass}>Data handling</label>
          <select
            name="data_handling"
            value={form.data_handling}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Last reviewed</label>
          <input
            type="date"
            name="last_reviewed_at"
            value={form.last_reviewed_at}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Vendor</label>
          <input
            type="text"
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            placeholder="Provider or publisher name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Privacy summary</label>
          <input
            type="text"
            name="privacy_summary"
            value={form.privacy_summary}
            onChange={handleChange}
            placeholder="Where user data is processed and retained"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Review notes</label>
          <textarea
            name="review_notes"
            value={form.review_notes}
            onChange={handleChange}
            className={`${inputClass} h-24 resize-y`}
            placeholder="Moderation checklist notes, trust rationale, and follow-up tasks"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-medium text-sm bg-accent-amber hover:bg-accent-amber/90 text-white transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Tool" : "Add Tool"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 font-medium text-sm glass-card text-foreground/60 hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
