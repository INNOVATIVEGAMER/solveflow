#!/usr/bin/env node
// Downloads the correct Typst binary for the current platform (local dev).
// The Linux x64 binary (for Vercel) is already committed to the repo.
// Run: node scripts/setup-typst.mjs

import { createWriteStream, existsSync, chmodSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { get } from "https";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_DIR = join(__dirname, "bin");
const VERSION = "v0.14.2";

const PLATFORM_MAP = {
  "darwin-arm64": {
    name: "typst-mac-arm64",
    url: `https://github.com/typst/typst/releases/download/${VERSION}/typst-aarch64-apple-darwin.tar.xz`,
    tarEntry: "typst-aarch64-apple-darwin/typst",
  },
  "darwin-x64": {
    name: "typst-mac-x64",
    url: `https://github.com/typst/typst/releases/download/${VERSION}/typst-x86_64-apple-darwin.tar.xz`,
    tarEntry: "typst-x86_64-apple-darwin/typst",
  },
};

const key = `${process.platform}-${process.arch}`;
const target = PLATFORM_MAP[key];

if (!target) {
  console.log(`Platform ${key} not supported by this script (or you're on Linux — the binary is already committed).`);
  process.exit(0);
}

const outPath = join(BIN_DIR, target.name);
if (existsSync(outPath)) {
  console.log(`✓ ${target.name} already exists. Nothing to do.`);
  process.exit(0);
}

console.log(`Downloading Typst ${VERSION} for ${key}…`);

const tmpTar = join(BIN_DIR, "_typst-download.tar.xz");

// Download
await new Promise((resolve, reject) => {
  function download(url) {
    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location);
        return;
      }
      const stream = createWriteStream(tmpTar);
      pipeline(res, stream).then(resolve).catch(reject);
    }).on("error", reject);
  }
  download(target.url);
});

console.log("Extracting…");
await execAsync(`tar -xJf "${tmpTar}" -C "${BIN_DIR}" "${target.tarEntry}"`);

// Move to correct name
const extracted = join(BIN_DIR, target.tarEntry);
await execAsync(`mv "${extracted}" "${outPath}"`);
chmodSync(outPath, 0o755);

// Clean up tar and empty dirs
await execAsync(`rm "${tmpTar}"`);
await execAsync(`rm -rf "${join(BIN_DIR, target.tarEntry.split("/")[0])}"`).catch(() => null);

// Verify
const { stdout } = await execAsync(`"${outPath}" --version`);
console.log(`✓ Installed: ${stdout.trim()}`);
