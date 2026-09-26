import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(
  await readFile(
    resolve(repoRoot, "katalog/_radni/imagegen/behaton-product-manifest.json"),
    "utf8",
  ),
);
const mediaSource = await readFile(resolve(repoRoot, "frontend/lib/behaton-media.ts"), "utf8");
const catalogUtilsSource = await readFile(
  resolve(repoRoot, "frontend/components/behaton/catalog-utils.ts"),
  "utf8",
);
const catalogPageSource = await readFile(resolve(repoRoot, "frontend/app/behaton/page.tsx"), "utf8");
const detailClientSource = await readFile(
  resolve(repoRoot, "frontend/app/behaton/[slug]/product-client.tsx"),
  "utf8",
);

const approved = manifest.products.filter((product) => product.status === "approved");
test("all approved behaton products have two generated catalog images", () => {
  assert.equal(approved.length, 19);

  for (const product of approved) {
    assert.ok(existsSync(resolve(repoRoot, product.mainPublic)), `${product.slug}: missing main image`);
    assert.ok(existsSync(resolve(repoRoot, product.groupPublic)), `${product.slug}: missing group image`);
    assert.ok(
      mediaSource.includes(`"${product.slug}": generatedMedia("${product.slug}")`),
      `${product.slug}: missing generated media override`,
    );
  }

  assert.match(mediaSource, /gallery: \[main, `\$\{base\}-group\.webp`\]/);
});

test("placeholder products remain visible but are sorted after named products", () => {
  assert.match(catalogUtilsSource, /export function sortBehatonProducts/);
  assert.match(catalogPageSource, /sortBehatonProducts\(/);
  assert.doesNotMatch(catalogPageSource, /\.filter\(isRealBehatonProduct\)/);
});

test("generated WebP packshots use contained product-image styling", () => {
  assert.match(catalogUtilsSource, /generated/);
  assert.match(detailClientSource, /generated/);
});
