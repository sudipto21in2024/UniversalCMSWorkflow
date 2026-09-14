import fs from "node:fs";
import path from "node:path";

/**
 * Normalizes color objects to hex strings
 */
function normalizeColor(color, opacity = 1) {
  if (!color) return null;
  const r = Math.round((color.r ?? 0) * 255);
  const g = Math.round((color.g ?? 0) * 255);
  const b = Math.round((color.b ?? 0) * 255);
  const a = color.a !== undefined ? color.a : opacity;
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
  }
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Flattens Figma AST into a dictionary of nodes keyed by ID
 */
export function flattenAst(rootNode, map = new Map(), parentId = null) {
  if (!rootNode) return map;
  
  const nodeSummary = {
    id: rootNode.id,
    name: rootNode.name,
    type: rootNode.type,
    parentId,
    characters: rootNode.characters || null,
    fontSize: rootNode.style?.fontSize || null,
    fontWeight: rootNode.style?.fontWeight || null,
    lineHeight: rootNode.style?.lineHeightPx || null,
    layoutMode: rootNode.layoutMode || null,
    itemSpacing: rootNode.itemSpacing || null,
    paddingLeft: rootNode.paddingLeft || null,
    paddingTop: rootNode.paddingTop || null,
    fills: (rootNode.fills || [])
      .filter((f) => f.visible !== false)
      .map((f) => (f.type === "SOLID" ? normalizeColor(f.color, f.opacity) : f.type)),
    strokes: (rootNode.strokes || [])
      .filter((s) => s.visible !== false)
      .map((s) => (s.type === "SOLID" ? normalizeColor(s.color, s.opacity) : s.type)),
    childrenIds: (rootNode.children || []).map((c) => c.id),
  };

  map.set(rootNode.id, nodeSummary);

  if (rootNode.children && Array.isArray(rootNode.children)) {
    for (const child of rootNode.children) {
      flattenAst(child, map, rootNode.id);
    }
  }

  return map;
}

/**
 * Finds the nearest matching component in the registry by walking up the node hierarchy
 */
export function resolveComponentForNode(nodeId, nodeMap, registry) {
  let currentId = nodeId;
  const components = registry?.components || {};

  while (currentId) {
    const node = nodeMap.get(currentId);
    if (!node) break;

    // Check if current node ID matches a registered component
    for (const [compName, compDef] of Object.entries(components)) {
      if (compDef.figmaNodeIds && compDef.figmaNodeIds.includes(currentId)) {
        return { componentName: compName, ...compDef, matchedNodeId: currentId };
      }
      if (compDef.figmaNames && compDef.figmaNames.includes(node.name)) {
        return { componentName: compName, ...compDef, matchedNodeId: currentId };
      }
    }

    currentId = node.parentId;
  }

  return null;
}

/**
 * Performs deep structural comparison between old and new AST trees
 */
export function diffAstSnapshots(oldRoot, newRoot, registry = null) {
  const oldMap = flattenAst(oldRoot);
  const newMap = flattenAst(newRoot);

  const addedNodes = [];
  const removedNodes = [];
  const modifiedNodes = [];

  // Check new vs old
  for (const [id, newNode] of newMap.entries()) {
    if (!oldMap.has(id)) {
      addedNodes.push({
        id,
        name: newNode.name,
        type: newNode.type,
        parentComponent: registry ? resolveComponentForNode(id, newMap, registry) : null,
      });
    } else {
      const oldNode = oldMap.get(id);
      const changes = {};

      if (newNode.characters !== oldNode.characters) {
        changes.characters = { old: oldNode.characters, new: newNode.characters };
      }
      if (newNode.fontSize !== oldNode.fontSize) {
        changes.fontSize = { old: oldNode.fontSize, new: newNode.fontSize };
      }
      if (newNode.fontWeight !== oldNode.fontWeight) {
        changes.fontWeight = { old: oldNode.fontWeight, new: newNode.fontWeight };
      }
      if (newNode.layoutMode !== oldNode.layoutMode) {
        changes.layoutMode = { old: oldNode.layoutMode, new: newNode.layoutMode };
      }
      if (newNode.itemSpacing !== oldNode.itemSpacing) {
        changes.itemSpacing = { old: oldNode.itemSpacing, new: newNode.itemSpacing };
      }
      if (JSON.stringify(newNode.fills) !== JSON.stringify(oldNode.fills)) {
        changes.fills = { old: oldNode.fills, new: newNode.fills };
      }

      if (Object.keys(changes).length > 0) {
        modifiedNodes.push({
          id,
          name: newNode.name,
          type: newNode.type,
          changes,
          parentComponent: registry ? resolveComponentForNode(id, newMap, registry) : null,
        });
      }
    }
  }

  // Check removed
  for (const [id, oldNode] of oldMap.entries()) {
    if (!newMap.has(id)) {
      removedNodes.push({
        id,
        name: oldNode.name,
        type: oldNode.type,
      });
    }
  }

  // Group modifications by affected components
  const affectedComponents = new Map();

  for (const item of [...addedNodes, ...modifiedNodes]) {
    const comp = item.parentComponent;
    if (comp) {
      if (!affectedComponents.has(comp.componentName)) {
        affectedComponents.set(comp.componentName, {
          component: comp.componentName,
          exportPath: comp.exportPath,
          type: comp.type,
          changesCount: 0,
          details: [],
        });
      }
      const entry = affectedComponents.get(comp.componentName);
      entry.changesCount++;
      entry.details.push(item);
    }
  }

  return {
    summary: {
      totalAdded: addedNodes.length,
      totalRemoved: removedNodes.length,
      totalModified: modifiedNodes.length,
      hasChanges: addedNodes.length > 0 || removedNodes.length > 0 || modifiedNodes.length > 0,
    },
    addedNodes,
    removedNodes,
    modifiedNodes,
    affectedComponents: Array.from(affectedComponents.values()),
  };
}

/**
 * Standalone runner for diffing two snapshot files
 */
if (process.argv[1] && process.argv[1].endsWith("ast-diff-engine.mjs")) {
  const [oldPath, newPath, registryPath] = process.argv.slice(2);

  if (!oldPath || !newPath) {
    console.log("Usage: node engine/scripts/ast-diff-engine.mjs <old_ast.json> <new_ast.json> [registry.json]");
    process.exit(0);
  }

  const oldJson = JSON.parse(fs.readFileSync(oldPath, "utf-8"));
  const newJson = JSON.parse(fs.readFileSync(newPath, "utf-8"));
  let registry = null;
  if (registryPath && fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  }

  const diff = diffAstSnapshots(oldJson, newJson, registry);
  console.log("\n=======================================================");
  console.log("             FIGMA AST DELTA REPORT                    ");
  console.log("=======================================================");
  console.log(`Has Changes: ${diff.summary.hasChanges ? "YES (Delta Detected)" : "NO (Unchanged)"}`);
  console.log(`Added Elements: ${diff.summary.totalAdded}`);
  console.log(`Removed Elements: ${diff.summary.totalRemoved}`);
  console.log(`Modified Elements: ${diff.summary.totalModified}`);

  if (diff.affectedComponents.length > 0) {
    console.log("\n🎯 Affected Reusable Components:");
    for (const comp of diff.affectedComponents) {
      console.log(`  - [${comp.type.toUpperCase()}] ${comp.component} (${comp.exportPath}) -> ${comp.changesCount} change(s)`);
    }
  }
  console.log("=======================================================\n");
}
