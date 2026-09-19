import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.resolve("public/assets/round8");
const outputDir = path.resolve("public/assets/round8-web");

await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(inputDir)).filter((name) => name.toLowerCase().endsWith(".png")).sort();
if (files.length !== 20) {
  throw new Error(`Expected 20 Round 8 PNG sources, found ${files.length}.`);
}

for (const filename of files) {
  const outputName = filename.replace(/\.png$/i, ".webp");
  await sharp(path.join(inputDir, filename))
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(path.join(outputDir, outputName));
  console.log(`Optimized ${filename} -> ${outputName}`);
}
