import fs from "fs";
import path from "path";

const blocksDir = path.join(process.cwd(), "dist-preview/blocks");

const replacements = [
  { from: "photo-1608248597359-00977a41982b", to: "photo-1620916566398-39f1143ab7be" },
  { from: "photo-1512290900672-1f41b52f1e63", to: "photo-1535585209827-a15fcdbc4c2d" },
  { from: "photo-1608248597359-7b3b723528fa", to: "photo-1570172619644-dfd03ed5d881" },
  { from: "photo-1512290900672-1f55b9959048", to: "photo-1617897903246-719242758050" }
];

function processDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      processDir(fullPath);
    } else if (item.name.endsWith(".html")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      let changed = false;
      for (const r of replacements) {
        if (content.includes(r.from)) {
          content = content.replaceAll(r.from, r.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, "utf-8");
        console.log(`Updated images in: ${item.name}`);
      }
    }
  }
}

processDir(blocksDir);
console.log("Image URL replacements complete!");
