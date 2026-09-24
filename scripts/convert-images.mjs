import { mkdir, readdir, copyFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicImages = path.join(root, "public", "images");
const sourceImages = path.join(root, "assets-src", "images");
const rasterPattern = /\.(png|jpe?g)$/i;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(absolute));
    else if (rasterPattern.test(entry.name)) files.push(absolute);
  }
  return files;
}

const files = await filesIn(publicImages);
for (const input of files) {
  const relative = path.relative(publicImages, input);
  const source = path.join(sourceImages, relative);
  const output = input.replace(rasterPattern, ".webp");
  await mkdir(path.dirname(source), { recursive: true });
  await copyFile(input, source);
  await sharp(input).webp({ quality: 95, alphaQuality: 100, effort: 4 }).toFile(output);
  await unlink(input);
}

console.log(`Converted ${files.length} images to WebP.`);