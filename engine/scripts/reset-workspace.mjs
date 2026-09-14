import fs from "fs";
import path from "path";
import readline from "readline";

/**
 * Universal Core Reset & Scrubber Utility
 * 
 * Safely purges client-specific artifacts (modules, routes, assets, dumps, state)
 * and restores the core framework to a pristine starter baseline.
 */

const rootDir = process.cwd();

// Targets for deletion/cleanup
const CLIENT_CLEANUP_TARGETS = {
  // Directories to empty or reset
  directoriesToClean: [
    path.join(rootDir, "src", "components", "modules"),
    path.join(rootDir, "public", "figma-assets", "icons"),
    path.join(rootDir, "public", "figma-assets", "images"),
    path.join(rootDir, "inputs", "vision"),
    path.join(rootDir, "Docs", "DirectDataDump"),
    path.join(rootDir, "dist-client"),
    path.join(rootDir, "dist-test"),
  ],
  // Sub-routes in src/app to remove (excluding globals.css, layout.tsx, and page.tsx which gets reset)
  appRouteSubdirs: [
    path.join(rootDir, "src", "app", "customers"),
    path.join(rootDir, "src", "app", "history"),
    path.join(rootDir, "src", "app", "login"),
    path.join(rootDir, "src", "app", "monitoring"),
    path.join(rootDir, "src", "app", "notes"),
    path.join(rootDir, "src", "app", "services-upload"),
    path.join(rootDir, "src", "app", "sms-settings"),
    path.join(rootDir, "src", "app", "staff"),
    path.join(rootDir, "src", "app", "students"),
    path.join(rootDir, "src", "app", "students-data"),
    path.join(rootDir, "src", "app", "tasks"),
  ],
  // Specific client state & spec files to purge
  filesToPurge: [
    path.join(rootDir, ".workflow-state.json"),
    path.join(rootDir, "Docs", "specs", "spec-dashboard.json"),
    path.join(rootDir, "engine", "registry", "component-registry.json"),
  ],
};

// Baseline clean templates to restore
const BASELINE_FILES = [
  {
    path: path.join(rootDir, "src", "components", "modules", ".gitkeep"),
    content: "",
  },
  {
    path: path.join(rootDir, "public", "figma-assets", ".gitkeep"),
    content: "",
  },
  {
    path: path.join(rootDir, "inputs", "vision", "README.md"),
    content: `# Visual & Multimodal Inputs\n\nPlace your UI design screenshots and companion JSON / TXT annotation files here:\n- \`[slug].png\` / \`[slug].jpg\`\n- \`[slug].json\` (Visual Block Annotator coordinates)\n- \`[slug].txt\` (Business logic & field specifications)\n`,
  },
  {
    path: path.join(rootDir, "engine", "registry", "component-registry.json"),
    content: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        version: "1.0.0",
        description: "Component Registry for Figma-to-Code Pipeline",
        components: {},
        routes: {},
      },
      null,
      2
    ),
  },
  {
    path: path.join(rootDir, "src", "app", "page.tsx"),
    content: `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 text-slate-800">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Universal CMS & Design-to-Code Framework
        </h1>
        <p className="text-sm text-slate-600">
          Core starter template active. Ingest a visual screenshot or Figma node to begin building client modules.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <a
            href="http://localhost:4040"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Launch Visual Annotator
          </a>
        </div>
      </div>
    </main>
  );
}
`,
  },
];

export function resetWorkspace({ dryRun = false, force = false } = {}) {
  console.log("\n=======================================================");
  console.log("   UNIVERSAL CORE FRAMEWORK: WORKSPACE SCRUBBER       ");
  console.log("=======================================================\n");

  let removedItemsCount = 0;

  // 1. Remove App Route Subdirectories
  for (const dir of CLIENT_CLEANUP_TARGETS.appRouteSubdirs) {
    if (fs.existsSync(dir)) {
      console.log(`[Scrubber] ${dryRun ? "Would remove route:" : "Removing route:"} ${path.relative(rootDir, dir)}`);
      if (!dryRun) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
      removedItemsCount++;
    }
  }

  // 2. Clean Target Directories
  for (const dir of CLIENT_CLEANUP_TARGETS.directoriesToClean) {
    if (fs.existsSync(dir)) {
      console.log(`[Scrubber] ${dryRun ? "Would clean directory:" : "Cleaning directory:"} ${path.relative(rootDir, dir)}`);
      if (!dryRun) {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
      }
      removedItemsCount++;
    }
  }

  // 3. Purge specific files
  for (const file of CLIENT_CLEANUP_TARGETS.filesToPurge) {
    if (fs.existsSync(file)) {
      console.log(`[Scrubber] ${dryRun ? "Would purge file:" : "Purging file:"} ${path.relative(rootDir, file)}`);
      if (!dryRun) {
        fs.unlinkSync(file);
      }
      removedItemsCount++;
    }
  }

  // 4. Restore Baseline Clean State
  if (!dryRun) {
    console.log("\n[Scrubber] Restoring pristine core baseline templates...");
    for (const item of BASELINE_FILES) {
      const parentDir = path.dirname(item.path);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(item.path, item.content, "utf-8");
      console.log(` - Restored: ${path.relative(rootDir, item.path)}`);
    }
  }

  console.log("\n=======================================================");
  if (dryRun) {
    console.log(`ℹ️ Dry run complete. Found ${removedItemsCount} client items to clean.`);
  } else {
    console.log(`✅ Core framework successfully scrubbed and reset to pristine state!`);
  }
  console.log("=======================================================\n");
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith("reset-workspace.mjs")) {
  const isDryRun = process.argv.includes("--dry-run");
  const isForce = process.argv.includes("--force") || process.argv.includes("-y");

  if (isDryRun || isForce) {
    resetWorkspace({ dryRun: isDryRun, force: isForce });
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "\n⚠️ CAUTION: This will delete all client-specific pages, components, assets, and dumps to reset the core template.\nAre you sure you want to proceed? [y/N]: ",
      (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() === "y") {
          resetWorkspace({ dryRun: false, force: true });
        } else {
          console.log("Workspace reset cancelled.");
        }
      }
    );
  }
}
