# Behaton Product Image Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and publish two consistent, realistic white-background images for every identified orderable behaton product: one single-product main image and one grouped detail image.

**Architecture:** A versioned manifest is the source of truth between existing product records, original reference photographs, generated master files, optimized public assets, and review status. Image generation is piloted on Classic 30x30x6 and then executed in small reviewed batches; the frontend uses explicit slug-based overrides so API data and original photographs remain intact and rollback is immediate.

**Tech Stack:** OpenAI ImageGen image editing, JSON manifest, Next.js 16, React 19, TypeScript, Node test runner, WebP catalog assets.

---

## File map

- Create `katalog/_radni/imagegen/behaton-product-manifest.json`: generation inputs, outputs, product order, and review state.
- Create `katalog/_radni/imagegen/prompts/main.txt`: locked single-product edit prompt.
- Create `katalog/_radni/imagegen/prompts/group.txt`: locked grouped-product edit prompt.
- Create `katalog/_radni/imagegen/masters/`: full-resolution approved ImageGen outputs.
- Create `scripts/optimize-behaton-images.mjs`: deterministic PNG-to-WebP export and dimension validation.
- Create `frontend/public/img/behaton/products/generated/`: optimized public WebP files.
- Modify `frontend/lib/behaton-media.ts`: explicit main and group media mappings for all approved products.
- Modify `frontend/components/behaton/catalog-utils.ts`: keep malformed records `1` and `2` last instead of silently treating their order as API-defined.
- Modify `frontend/app/behaton/page.tsx`: use the catalog ordering helper.
- Create `frontend/tests/behaton-product-media.test.mjs`: validate coverage, filenames, ordering, and file existence.

Do not overwrite or reformat unrelated working-tree edits in the frontend files above. Patch only the smallest relevant blocks. `frontend/lib/behaton-media.ts`, `frontend/app/behaton/page.tsx`, and the untracked `frontend/components/behaton/catalog-utils.ts` already contain user work; do not stage or commit those overlapping files unless the user first confirms the existing changes belong in the same commit.

### Task 1: Build the source-of-truth manifest and lock prompts

**Files:**
- Create: `katalog/_radni/imagegen/behaton-product-manifest.json`
- Create: `katalog/_radni/imagegen/prompts/main.txt`
- Create: `katalog/_radni/imagegen/prompts/group.txt`

- [ ] **Step 1: Create the manifest with the 17 identified products**

Use this schema for every entry:

```json
{
  "id": 10,
  "slug": "ploca-classic-dimenzija-30x30-d-6-cm",
  "label": "PLOCA CLASSIC 30x30 d=6 cm",
  "reference": "docs/behaton-xlsx-extract/xl/media/image6.jpeg",
  "mainMaster": "katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-main.png",
  "groupMaster": "katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-group.png",
  "mainPublic": "frontend/public/img/behaton/products/generated/ploca-classic-dimenzija-30x30-d-6-cm-main.webp",
  "groupPublic": "frontend/public/img/behaton/products/generated/ploca-classic-dimenzija-30x30-d-6-cm-group.webp",
  "status": "pending"
}
```

Populate entries for product IDs `7` through `23`. Use the source mapping in `docs/behaton-products-map.csv`; for City Line, whose spreadsheet row has no image, use `frontend/public/img/behaton/products/city-line-24x16.jpg`. Do not add IDs `5` and `6` to the generation queue until their identity is known.

Use these exact primary references:

| ID | Slug | Reference |
|---:|---|---|
| 7 | `ploca-behaton-16-5x20-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image9.jpeg` |
| 8 | `ploca-behaton-16-5x20-d-8-cm` | `docs/behaton-xlsx-extract/xl/media/image10.jpeg` |
| 9 | `ploca-behaton-ravna-ivica-16-5x20-d-10-cm` | `docs/behaton-xlsx-extract/xl/media/image8.jpeg` |
| 10 | `ploca-classic-dimenzija-30x30-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image6.jpeg` |
| 11 | `ploca-elegance-dimenzija-20x20-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image4.jpeg` |
| 12 | `ploca-elegance-dimenzija-20x20-d-8-cm` | `docs/behaton-xlsx-extract/xl/media/image11.jpeg` |
| 13 | `ploca-uni-elegance-dimenzija-20x10-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image1.jpeg` |
| 14 | `ploca-mini-elegance-dimenzija-10x10-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image5.jpeg` |
| 15 | `ploca-uni-profil-dimenzija-24x12-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image13.jpeg` |
| 16 | `ploca-sace-dimenzija-22x22-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image22.jpeg` |
| 17 | `ploca-city-line-ravna-ivica-dimenzija-24x16-d-6-cm` | `frontend/public/img/behaton/products/city-line-24x16.jpg` |
| 18 | `ploca-antica-dimenzija-7-50-x-11-50-x-10-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image19.jpeg` |
| 19 | `ploca-combo-ravna-ivica-60x40-d-6-cm-1-kom-m-40x40-d-6-cm-2-kom-m-40x20-d-6-cm-3-kom-m-20x20-d-6-cm-4-kom-m` | `docs/behaton-xlsx-extract/xl/media/image15.jpeg` |
| 20 | `ploca-city-park-ravna-ivica-7x14-d-6-cm-12-kom-m-14x14-d-6-cm-18-kom-m-21x14-d-6-cm-18-kom-m` | `docs/behaton-xlsx-extract/xl/media/image17.jpeg` |
| 21 | `ploca-vodilja-taktilna-dimenzija-30x30-d-6-cm` | `docs/behaton-xlsx-extract/xl/media/image18.jpeg` |
| 22 | `ploca-eco-dimenzija-20x20-d-8-cm` | `docs/behaton-xlsx-extract/xl/media/image21.jpeg` |
| 23 | `ploca-raster-dimenzija-60x40-d-10-cm` | `docs/behaton-xlsx-extract/xl/media/image14.jpeg` |

- [ ] **Step 2: Validate the manifest mechanically**

Run:

```powershell
$manifest = Get-Content -Raw katalog/_radni/imagegen/behaton-product-manifest.json | ConvertFrom-Json
if ($manifest.products.Count -ne 17) { throw "Expected 17 identified products" }
$manifest.products | ForEach-Object {
  if (-not (Test-Path -LiteralPath $_.reference)) { throw "Missing reference: $($_.reference)" }
  if (-not $_.mainPublic.EndsWith('-main.webp')) { throw "Bad main filename: $($_.mainPublic)" }
  if (-not $_.groupPublic.EndsWith('-group.webp')) { throw "Bad group filename: $($_.groupPublic)" }
}
```

Expected: command exits successfully with no output.

- [ ] **Step 3: Save the exact main-image prompt**

Save this text verbatim:

```text
Edit the referenced photograph into a premium, photorealistic square studio catalog image. Show exactly one isolated instance of the referenced concrete paving product at a natural three-quarter camera angle so its top surface and true edge thickness are clearly visible. Preserve the real product exactly: silhouette, proportions, dimensions, corner treatment, edge profile, openings, grooves, spacers, concrete aggregate, surface roughness, imperfections, and source color variation. Do not redesign, beautify, straighten, smooth, recolor, or repair the product.

Use a seamless pure white #FFFFFF background with no visible horizon. Use soft neutral studio lighting, accurate white balance, crisp but natural texture, and one subtle physically plausible contact shadow directly beneath the product. Center the product with consistent generous margins and no cropping.

Remove all original surroundings, including people, hands, shoes, pallets, straps, dirt, gravel, mud, weeds, vehicles, adjacent products, labels, text, logos, and watermarks. Do not invent geometry, openings, joints, colors, pieces, bevels, dimensions, or surface patterns. Do not make the concrete glossy, plastic, overly smooth, illustrated, or CGI-rendered. The result must look like an honest professional photograph of the exact referenced product.
```

- [ ] **Step 4: Save the exact group-image prompt**

Save this text verbatim:

```text
Edit the referenced photograph into a premium, photorealistic square studio catalog image. Show three to five identical instances of the referenced concrete paving product in a tidy, physically believable small group at a natural three-quarter camera angle. Arrange them so the top surfaces, true edge thickness, joints, repeating geometry, and stacking behavior are easy to understand. Preserve the real product exactly: silhouette, proportions, dimensions, corner treatment, edge profile, openings, grooves, spacers, concrete aggregate, surface roughness, imperfections, and source color variation. Every piece must be the same real product; do not introduce a second variant.

Use a seamless pure white #FFFFFF background with no visible horizon. Match the main image's camera family, product scale, soft neutral studio lighting, accurate white balance, and natural concrete texture. Add only subtle physically plausible contact shadows. Center the group with consistent generous margins and no cropping.

Remove all original surroundings, including people, hands, shoes, pallets, straps, dirt, gravel, mud, weeds, vehicles, unrelated products, labels, text, logos, and watermarks. Do not invent geometry, openings, joints, colors, pieces, bevels, dimensions, or surface patterns. Do not make the concrete glossy, plastic, overly smooth, illustrated, or CGI-rendered. The result must look like an honest professional photograph of the exact referenced product.
```

For Combo and City Park only, replace “three to five identical instances” with: “one complete representative arrangement using only the real component formats and ratios visible in the reference photograph and written product specification.”

- [ ] **Step 5: Commit the manifest and prompts**

```powershell
git add -- katalog/_radni/imagegen/behaton-product-manifest.json katalog/_radni/imagegen/prompts/main.txt katalog/_radni/imagegen/prompts/group.txt
git commit -m "chore: define behaton image generation manifest"
```

### Task 2: Generate and approve the Classic pilot

**Files:**
- Read: `docs/behaton-xlsx-extract/xl/media/image6.jpeg`
- Create: `katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-main.png`
- Create: `katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-group.png`
- Modify: `katalog/_radni/imagegen/behaton-product-manifest.json`

- [ ] **Step 1: Inspect the original at full detail**

Record the visible shape, corner treatment, surface texture, color, and thickness before generation. The reference, not the prompt, is authoritative.

- [ ] **Step 2: Generate the main pilot as an image edit**

Pass `docs/behaton-xlsx-extract/xl/media/image6.jpeg` as the referenced image and the full contents of `main.txt`, plus `Product: PLOCA CLASSIC, 30x30 cm, d=6 cm.` Do not use text-only generation.

- [ ] **Step 3: Review the main pilot against the quality gate**

Reject it if any corner, edge, thickness, texture, color, or proportion changes, if the background is not white, or if it looks rendered rather than photographed. Regenerate with a correction that names the specific mismatch.

- [ ] **Step 4: Generate the group pilot as an image edit**

Use the same original reference, `group.txt`, and product specification. Require three to five identical real Classic slabs; do not allow multiple colors unless they are all present in the authoritative reference.

- [ ] **Step 5: Review the group pilot against the main pilot and source**

Confirm that both images depict the same product, material, color, corner profile, thickness, camera family, white background, and lighting family.

- [ ] **Step 6: Mark pilot status**

Set the Classic entry to `"status": "approved"` only after both images pass. Otherwise keep `"status": "needs-regeneration"` with a short `reviewNotes` value naming the defect.

- [ ] **Step 7: Commit the approved masters and status**

```powershell
git add -- katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-main.png katalog/_radni/imagegen/masters/ploca-classic-dimenzija-30x30-d-6-cm-group.png katalog/_radni/imagegen/behaton-product-manifest.json
git commit -m "feat: approve Classic behaton studio image pilot"
```

### Task 3: Generate the remaining identified products in reviewed batches

**Files:**
- Read: references listed in `katalog/_radni/imagegen/behaton-product-manifest.json`
- Create: 32 remaining PNG masters under `katalog/_radni/imagegen/masters/`
- Modify: `katalog/_radni/imagegen/behaton-product-manifest.json`

- [ ] **Step 1: Process simple solid paving products**

Generate main then group images for Behaton 6/8/10 cm, Elegance 6/8 cm, Uni Elegance, Mini Elegance, Uni Profil, and City Line. Review each pair before moving its manifest status to `approved`.

- [ ] **Step 2: Process distinctive-profile products**

Generate main then group images for Saće, Antica, Vodilja, Eco, and Raster. Pay particular attention to the exact number and geometry of openings, tactile ridges, curves, and interlocking edges.

- [ ] **Step 3: Process multi-format systems**

Generate Combo and City Park last. Their main images show one complete real component set, and their group images show a plausible repeated layout. Reject any output that substitutes uniform rectangles or changes the component count/ratio.

- [ ] **Step 4: Audit manifest completion**

Run:

```powershell
$manifest = Get-Content -Raw katalog/_radni/imagegen/behaton-product-manifest.json | ConvertFrom-Json
$pending = @($manifest.products | Where-Object status -ne 'approved')
if ($pending.Count) { $pending | Select-Object id, slug, status; throw "Unapproved product images remain" }
$manifest.products | ForEach-Object {
  if (-not (Test-Path -LiteralPath $_.mainMaster)) { throw "Missing main master: $($_.mainMaster)" }
  if (-not (Test-Path -LiteralPath $_.groupMaster)) { throw "Missing group master: $($_.groupMaster)" }
}
```

Expected: 17 approved products and 34 existing master files.

- [ ] **Step 5: Commit each completed batch**

Use one commit per reviewed batch so a bad visual family can be reverted independently:

```powershell
git add -- katalog/_radni/imagegen/masters katalog/_radni/imagegen/behaton-product-manifest.json
git commit -m "feat: add reviewed behaton studio image batch"
```

### Task 4: Optimize approved assets for the storefront

**Files:**
- Read: `katalog/_radni/imagegen/masters/*.png`
- Create: `scripts/optimize-behaton-images.mjs`
- Create: `frontend/public/img/behaton/products/generated/*.webp`

- [ ] **Step 1: Add the deterministic optimizer**

Create `scripts/optimize-behaton-images.mjs` with this behavior:

```js
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "../frontend/node_modules/sharp/lib/index.js";

const repoRoot = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await readFile(resolve(repoRoot, "katalog/_radni/imagegen/behaton-product-manifest.json"), "utf8"),
);

let processed = 0;

for (const product of manifest.products.filter((item) => item.status === "approved")) {
  for (const variant of ["main", "group"]) {
    const source = resolve(repoRoot, product[`${variant}Master`]);
    const output = resolve(repoRoot, product[`${variant}Public`]);
    await mkdir(dirname(output), { recursive: true });
    await sharp(source)
      .flatten({ background: "#ffffff" })
      .resize(1600, 1600, { fit: "contain", background: "#ffffff" })
      .webp({ quality: 88, smartSubsample: true })
      .toFile(output);

    const metadata = await sharp(output).metadata();
    if (metadata.width !== 1600 || metadata.height !== 1600 || metadata.format !== "webp") {
      throw new Error(`Invalid optimized asset: ${product[`${variant}Public`]}`);
    }
    processed += 1;
  }
}

const expected = manifest.products.filter((item) => item.status === "approved").length * 2;
if (processed !== expected) throw new Error(`Expected ${expected} outputs, created ${processed}`);
```

- [ ] **Step 2: Convert masters to WebP assets**

Run:

```powershell
node scripts/optimize-behaton-images.mjs
```

Expected: 34 WebP files are created without modifying the PNG masters.

- [ ] **Step 3: Verify count and dimensions**

Re-run `node scripts/optimize-behaton-images.mjs`. Expected exit code is 0; any wrong dimension, wrong format, or missing output throws with the failing public path.

- [ ] **Step 4: Spot-check white corners and compression**

Inspect Classic, Raster, Combo, and one multicolor item at full detail. Reject visible halos, gray corner pixels, block artifacts, texture smearing, or clipped shadows.

- [ ] **Step 5: Commit optimizer and public assets**

```powershell
git add -- scripts/optimize-behaton-images.mjs frontend/public/img/behaton/products/generated
git commit -m "feat: add optimized behaton catalog imagery"
```

### Task 5: Map main and group images into the catalog

**Files:**
- Modify: `frontend/lib/behaton-media.ts:5-119`
- Create: `frontend/tests/behaton-product-media.test.mjs`

- [ ] **Step 1: Write the failing coverage test**

The test must read `katalog/_radni/imagegen/behaton-product-manifest.json` and `frontend/lib/behaton-media.ts`, then assert for every approved slug that both generated public paths appear in the mapping and both files exist. It must also assert that each `-main.webp` appears before its matching `-group.webp` in that product's mapping.

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(
  readFileSync(resolve(repoRoot, "katalog/_radni/imagegen/behaton-product-manifest.json"), "utf8"),
);
const mediaSource = readFileSync(resolve(repoRoot, "frontend/lib/behaton-media.ts"), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPublicUrl = (path) => path.replace(/^frontend\/public/, "").replaceAll("\\\\", "/");

test("every approved behaton product maps main then group images", () => {
  assert.equal(manifest.products.filter((p) => p.status === "approved").length, 17);
  for (const product of manifest.products) {
    assert.match(mediaSource, new RegExp(escapeRegExp(product.slug)));
    assert.ok(existsSync(resolve(repoRoot, product.mainPublic)));
    assert.ok(existsSync(resolve(repoRoot, product.groupPublic)));
    assert.ok(mediaSource.indexOf(toPublicUrl(product.mainPublic)) < mediaSource.indexOf(toPublicUrl(product.groupPublic)));
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
cd frontend
npm test
```

Expected: the new test fails because generated mappings are not yet present.

- [ ] **Step 3: Replace legacy overrides with explicit generated pairs**

For every approved slug in `behatonProductMedia`, set `listingImage` and `detailImage` to its `-main.webp` URL and set `gallery` to `[mainUrl, groupUrl]`. Change `applyBehatonProductMedia` so an override replaces the public gallery instead of appending stale API gallery items:

```ts
return {
  ...product,
  image: detailImage,
  gallery: overrideGallery.length > 0 ? dedupeMedia(overrideGallery) : existingGallery,
};
```

This ensures the detail page shows main first and group second, while products without approved overrides retain their existing API gallery.

- [ ] **Step 4: Run tests and verify they pass**

Run:

```powershell
cd frontend
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Preserve the overlapping working-tree changes**

Run `git diff -- frontend/lib/behaton-media.ts` and inspect the complete diff. Do not stage or commit the file while unrelated user changes remain mixed into it. Report the exact task-owned hunks at handoff.

### Task 6: Put placeholder records last without generating misleading images

**Files:**
- Modify: `frontend/components/behaton/catalog-utils.ts`
- Modify: `frontend/app/behaton/page.tsx`
- Modify: `frontend/tests/behaton-product-media.test.mjs`

- [ ] **Step 1: Write a failing ordering integration test**

Because the existing Node test suite intentionally reads TypeScript source rather than transpiling application modules, add source-level assertions that `catalog-utils.ts` exports `sortBehatonProducts`, that `page.tsx` calls it after the category filter, and that `page.tsx` no longer calls `isRealBehatonProduct`.

```js
const catalogUtilsSource = readFileSync(
  resolve(repoRoot, "frontend/components/behaton/catalog-utils.ts"),
  "utf8",
);
const behatonPageSource = readFileSync(
  resolve(repoRoot, "frontend/app/behaton/page.tsx"),
  "utf8",
);

test("placeholder behaton records are retained and sorted last", () => {
  assert.match(catalogUtilsSource, /export function sortBehatonProducts/);
  assert.match(behatonPageSource, /sortBehatonProducts\(/);
  assert.doesNotMatch(behatonPageSource, /\.filter\(isRealBehatonProduct\)/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run `npm test` from `frontend`. Expected: fail because the helper does not exist.

- [ ] **Step 3: Implement the stable ordering helper**

```ts
export function sortBehatonProducts(products: Product[]) {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aPlaceholder = /^\d+$/.test(a.product.name.trim());
      const bPlaceholder = /^\d+$/.test(b.product.name.trim());
      if (aPlaceholder !== bPlaceholder) return aPlaceholder ? 1 : -1;
      return a.index - b.index;
    })
    .map(({ product }) => product);
}
```

Use this helper in `frontend/app/behaton/page.tsx` after the category filter. Remove the `isRealBehatonProduct` filter from the page so records `1` and `2` remain visible at the end with their existing API images until identified.

- [ ] **Step 4: Run tests and verify they pass**

Run `npm test` from `frontend`. Expected: all tests pass.

- [ ] **Step 5: Preserve the overlapping ordering changes**

Inspect `git diff -- frontend/app/behaton/page.tsx` and the full untracked contents of `frontend/components/behaton/catalog-utils.ts`. Do not stage or commit either file while unrelated user work remains mixed into them. Report the task-owned changes at handoff.

### Task 7: Verify the complete storefront behavior

**Files:**
- Verify: `frontend/app/behaton/page.tsx`
- Verify: `frontend/app/behaton/[slug]/product-client.tsx`
- Verify: `frontend/public/img/behaton/products/generated/`

- [ ] **Step 1: Run automated checks**

```powershell
cd frontend
npm test
npm run lint
npm run lint:encoding
npm run build
```

Expected: all commands exit with code 0. Existing unrelated failures must be reported separately and must not be hidden by changing unrelated files.

- [ ] **Step 2: Inspect the catalog grid on desktop and mobile**

Confirm all 17 identified products use their new main images, white is consistent across cards, products are not clipped, and `1` and `2` appear last with their existing images.

- [ ] **Step 3: Inspect representative detail pages**

Check Classic, Raster, Combo, and Vodilja. Each must show exactly the approved main image first and grouped image second; thumbnail selection must work and both images must use contain-style presentation without cropping.

- [ ] **Step 4: Confirm scope isolation**

Verify the project gallery and behaton hero still reference `/img/behaton/optimized/SLI_*.webp` and were not replaced.

- [ ] **Step 5: Record deferred placeholder work**

Document that IDs `5` and `6` still require real names, dimensions, and authoritative reference photographs before their four generated images can be produced.

- [ ] **Step 6: Record final verification-only fixes, if any**

List only fixes directly required by the checks above. Do not stage unrelated pre-existing working-tree changes; create a final integration commit only after the user confirms how the existing dirty frontend work should be grouped.
