#!/usr/bin/env node
// build_index.mjs
//
// Usage: node scripts/build_index.mjs
//
// Reads every packs/<slug>/pack.json in this repo, cross-references `git tag --list`
// to find the highest semver tag matching `<slug>-v<version>`, and writes index.json
// at the repo root. The output schema is documented in README.md and consumed by the
// fazer-ai-atendimento plugin via https://raw.githubusercontent.com/fazer-ai/n8n-workflows/main/index.json.
//
// No external dependencies: Node stdlib only.
// Exits non-zero on malformed pack.json. Packs with no matching tag yet get
// `latest_version: null` so CI does not fail for freshly-added packs.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PACKS_DIR = join(REPO_ROOT, "packs");
const INDEX_PATH = join(REPO_ROOT, "index.json");
const SCHEMA_VERSION = "1";
const TARBALL_URL_TEMPLATE =
  "https://github.com/fazer-ai/n8n-workflows/archive/refs/tags/{slug}-v{version}.tar.gz";

function listPackDirs() {
  let entries;
  try {
    entries = readdirSync(PACKS_DIR);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  return entries
    .filter((name) => {
      const full = join(PACKS_DIR, name);
      try {
        return statSync(full).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function loadPackManifest(slug) {
  const manifestPath = join(PACKS_DIR, slug, "pack.json");
  let raw;
  try {
    raw = readFileSync(manifestPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`pack "${slug}" is missing pack.json at ${manifestPath}`);
    }
    throw err;
  }
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (err) {
    throw new Error(`pack "${slug}" has malformed pack.json: ${err.message}`);
  }
  const required = ["slug", "name", "description", "version"];
  for (const field of required) {
    if (!manifest[field]) {
      throw new Error(`pack "${slug}" pack.json missing required field "${field}"`);
    }
  }
  if (manifest.slug !== slug) {
    throw new Error(
      `pack "${slug}" pack.json slug mismatch: manifest says "${manifest.slug}", directory is "${slug}"`,
    );
  }
  return manifest;
}

function readAllGitTags() {
  // Single shell-out; parse the rest in JS.
  try {
    const out = execSync("git tag --list", { cwd: REPO_ROOT, encoding: "utf8" });
    return out.split("\n").map((t) => t.trim()).filter(Boolean);
  } catch (err) {
    // Not a git repo or no tags yet: return empty list, don't abort index generation.
    if (err.status && err.status !== 0) return [];
    throw err;
  }
}

function parseSemver(v) {
  // Accepts "1.2.3" or "1.2.3-rc.1"; ignores pre-release for ordering simplicity
  // (we sort by MAJOR.MINOR.PATCH and keep the first stable hit).
  const m = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function cmpSemver(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function latestVersionForSlug(slug, tags) {
  const prefix = `${slug}-v`;
  const versions = [];
  for (const tag of tags) {
    if (!tag.startsWith(prefix)) continue;
    const raw = tag.slice(prefix.length);
    const parsed = parseSemver(raw);
    if (parsed) versions.push({ raw, parsed });
  }
  if (!versions.length) return null;
  versions.sort((a, b) => cmpSemver(b.parsed, a.parsed));
  return versions[0].raw;
}

function buildIndexEntry(manifest, latestVersion) {
  const entry = {
    slug: manifest.slug,
    name: manifest.name,
    description: manifest.description,
    latest_version: latestVersion,
    language: manifest.language ?? null,
    min_plugin_version: manifest.min_plugin_version ?? null,
    tags: Array.isArray(manifest.tags) ? manifest.tags : [],
    path: `packs/${manifest.slug}`,
    tarball_url_template: TARBALL_URL_TEMPLATE,
  };
  return entry;
}

function main() {
  const slugs = listPackDirs();
  const tags = readAllGitTags();
  const packs = [];
  for (const slug of slugs) {
    const manifest = loadPackManifest(slug);
    const latest = latestVersionForSlug(slug, tags);
    packs.push(buildIndexEntry(manifest, latest));
  }

  // Preserve updated_at when nothing semantic changed. Otherwise the Actions
  // job pushes timestamp-only commits that race between parallel runs (e.g.
  // commit push + tag push firing together) and fill history with empty diffs.
  let previousUpdatedAt = null;
  try {
    const previous = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
    if (
      previous.schema_version === SCHEMA_VERSION &&
      JSON.stringify(previous.packs) === JSON.stringify(packs)
    ) {
      previousUpdatedAt = previous.updated_at;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  const index = {
    schema_version: SCHEMA_VERSION,
    updated_at:
      previousUpdatedAt ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    packs,
  };
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");
  process.stdout.write(
    `wrote ${INDEX_PATH} with ${packs.length} pack${packs.length === 1 ? "" : "s"}\n`,
  );
}

try {
  main();
} catch (err) {
  process.stderr.write(`build_index: ${err.message}\n`);
  process.exit(1);
}
