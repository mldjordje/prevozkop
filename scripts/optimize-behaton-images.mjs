import { readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "../frontend/node_modules/sharp/lib/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(
  repoRoot,
  "katalog/_radni/imagegen/behaton-product-manifest.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const approved = manifest.products.filter((product) => product.status === "approved");

if (approved.length !== 17) {
  throw new Error(`Expected 17 approved products, found ${approved.length}.`);
}

const outputs = [];

for (const product of approved) {
  for (const variant of ["main", "group"]) {
    const source = resolve(repoRoot, product[`${variant}Master`]);
    const destination = resolve(repoRoot, product[`${variant}Public`]);

    await mkdir(dirname(destination), { recursive: true });
    await sharp(source)
      .flatten({ background: "#ffffff" })
      .resize(1600, 1600, {
        fit: "contain",
        background: "#ffffff",
        withoutEnlargement: true,
      })
      .webp({ quality: 88, effort: 6 })
      .toFile(destination);

    const metadata = await sharp(destination).metadata();
    if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
      throw new Error(`Invalid optimized image: ${destination}`);
    }

    outputs.push({
      product: product.slug,
      variant,
      width: metadata.width,
      height: metadata.height,
      path: product[`${variant}Public`],
    });
  }
}

if (outputs.length !== 34) {
  throw new Error(`Expected 34 optimized images, created ${outputs.length}.`);
}

console.log(JSON.stringify({ count: outputs.length, outputs }, null, 2));
