/**
 * Vite preserves a nested HTML input path. GitHub Pages requires index.html
 * at the artifact root, so copy the built HTML after bundling.
 * Hash routing means every in-game location survives reloads without rewrites.
 */
import { copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const output = resolve("dist-pages");
const generated = resolve(output, "pages/index.html");
const assets = resolve(output, "assets");
if (!existsSync(generated)) {
  throw new Error("Pages HTML missing. Check Vite's pages/index.html input.");
}
if (!existsSync(assets) || !readdirSync(assets).some((file) => file.endsWith(".js"))) {
  throw new Error("Pages JavaScript bundle missing. Refusing to package an empty site.");
}
const html = readFileSync(generated, "utf8");
if (!html.includes('id="root"') || !/assets\/[^"']+\.js/.test(html)) {
  throw new Error("Built HTML has no game mount point or bundled JS.");
}
copyFileSync(generated, resolve(output, "index.html"));
copyFileSync(generated, resolve(output, "404.html"));
console.log("GitHub Pages bundle: dist-pages/index.html and dist-pages/404.html ready.");
