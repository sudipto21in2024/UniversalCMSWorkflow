import fs from "fs";
import path from "path";

const figmaPath = path.join(process.cwd(), "Docs/figma-data/raw/figma-canvas.json");
const data = JSON.parse(fs.readFileSync(figmaPath, "utf-8"));

function findNode(root, id) {
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = findNode(c, id);
      if (f) return f;
    }
  }
  return null;
}

const node = findNode(data.document, "27309:256");
console.log(JSON.stringify(node, null, 2));
