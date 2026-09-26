import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("homepage renders the responsive video hero instead of the image slider", async () => {
  assert.match(pageSource, /import HeroVideo from ["']@\/components\/hero-video["']/);
  assert.match(pageSource, /<HeroVideo\b/);
  assert.doesNotMatch(pageSource, /<HeroSlider\b/);

  const heroSource = await readFile(new URL("../components/hero-video.tsx", import.meta.url), "utf8");
  assert.equal((heroSource.match(/<video\b/g) ?? []).length, 1);
  assert.match(heroSource, /autoPlay/);
  assert.match(heroSource, /muted/);
  assert.match(heroSource, /loop/);
  assert.match(heroSource, /playsInline/);
  assert.match(heroSource, /https:\/\/api\.prevozkop\.rs\/video\/hero-mobile\.mp4/);
  assert.match(heroSource, /https:\/\/api\.prevozkop\.rs\/video\/hero-desktop\.mp4/);
  assert.match(heroSource, /media=["']\(max-width: 767px\)["']/);
  assert.match(heroSource, /poster=["']\/img\/napolje1\.webp["']/);
});
