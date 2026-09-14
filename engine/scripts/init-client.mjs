import fs from "fs";
import path from "path";
import readline from "readline";

/**
 * Client Project Genesis & Target Platform Locker
 * 
 * Initializes a new single-target client project, locks the target CMS architecture
 * (Shopify Liquid, WordPress PHP, Headless Next.js, etc.) into .workflow-state.json,
 * configures the Visual Annotator preset, and prepares clean staging directories.
 */

const rootDir = process.cwd();

const TARGET_PRESET_MAP = {
  "shopify-liquid": {
    name: "Shopify Native Liquid Theme",
    presetFile: "preset.shopify.json",
    presetId: "shopify",
    outputDir: "dist-client/sections",
    description: "Native .liquid sections with embedded {% schema %} settings and customizer presets",
  },
  "shopify-headless": {
    name: "Shopify Headless + Next.js",
    presetFile: "preset.shopify.json",
    presetId: "shopify",
    outputDir: "src/components/modules",
    description: "React 19 Server Components with Storefront GraphQL queries and Metaobject blueprints",
  },
  "wordpress-php": {
    name: "WordPress Classic PHP Theme",
    presetFile: "preset.wordpress-acf.json",
    presetId: "wordpress-acf",
    outputDir: "dist-client/template-parts",
    description: "PHP template-parts with ACF Pro get_field() bindings and JSON field group exports",
  },
  "sitecore-razor": {
    name: "Sitecore Traditional .NET Razor",
    presetFile: "preset.sitecore.json",
    presetId: "sitecore",
    outputDir: "dist-client/Views/Renderings",
    description: "C# ViewModels with Razor .cshtml view components and item serialization",
  },
  "contentful-headless": {
    name: "Contentful Headless + Next.js",
    presetFile: "preset.contentful.json",
    presetId: "contentful",
    outputDir: "src/components/modules",
    description: "React 19 Server Components with Contentful migrations and GraphQL delivery queries",
  },
  "nextjs-standalone": {
    name: "Pure Next.js 15 App Router",
    presetFile: "preset.nextjs-tailwind.json",
    presetId: "nextjs-tailwind",
    outputDir: "src/components/modules",
    description: "Standard Next.js 15 + Tailwind CSS + Radix UI application without CMS ties",
  },
};

export async function initClientProject({
  clientSlug,
  targetPlatform,
  clientName,
  hasAcfPro = false,
  customFieldsPlugin = "free-acf-scf",
} = {}) {
  console.log("\n=======================================================");
  console.log("   CLIENT PROJECT GENESIS: TARGET ARCHITECTURE LOCK   ");
  console.log("=======================================================\n");

  const statePath = path.join(rootDir, ".workflow-state.json");
  const annotatorConfigPath = path.join(rootDir, "tools", "visual-annotator", "annotator.config.json");

  // Validate target platform
  if (!TARGET_PRESET_MAP[targetPlatform]) {
    console.error(`❌ Invalid target platform: '${targetPlatform}'`);
    console.log("\nAvailable targets:");
    Object.entries(TARGET_PRESET_MAP).forEach(([key, info]) => {
      console.log(` - \x1b[36m${key}\x1b[0m : ${info.name} (${info.description})`);
    });
    process.exit(1);
  }

  const targetConfig = TARGET_PRESET_MAP[targetPlatform];
  const slug = clientSlug || "client-project";
  const displayName = clientName || slug.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  console.log(`🏢 Client Project : \x1b[1m${displayName}\x1b[0m (\x1b[33m${slug}\x1b[0m)`);
  console.log(`🎯 Locked Target  : \x1b[32m${targetConfig.name}\x1b[0m`);
  console.log(`📁 Primary Output : \x1b[90m${targetConfig.outputDir}\x1b[0m`);
  if (targetPlatform === "wordpress-php") {
    console.log(`🔑 ACF Pro License: \x1b[33m${hasAcfPro ? "Active (Pro)" : "None (Free ACF / Secure Custom Fields / OpenFields Fallback)"}\x1b[0m\n`);
  } else {
    console.log("");
  }

  // 1. Create or update .workflow-state.json with Genesis Lock
  let state = {};
  if (fs.existsSync(statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    } catch (e) {
      state = {};
    }
  }

  state = {
    ...state,
    workflowId: `wf-${slug}-${Date.now()}`,
    client: {
      slug,
      name: displayName,
      targetPlatform,
      targetName: targetConfig.name,
      outputDir: targetConfig.outputDir,
      hasAcfProLicense: Boolean(hasAcfPro),
      customFieldsPlugin: hasAcfPro ? "acf-pro" : customFieldsPlugin,
      lockedAt: new Date().toISOString(),
    },
    status: "TARGET_LOCKED",
    lastUpdated: new Date().toISOString(),
    stages: {
      "step-0-genesis-lock": {
        status: "COMPLETED",
        targetPlatform,
        completedAt: new Date().toISOString(),
      },
      "step-1-vision-modeling": { status: "PENDING" },
      "step-2-html-approval": { status: "PENDING" },
      "step-3-native-code-generation": { status: "PENDING" },
    },
  };

  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
  console.log("✔ Locked target architecture into \x1b[33m.workflow-state.json\x1b[0m");

  // 2. Configure Visual Annotator Studio default preset
  if (fs.existsSync(annotatorConfigPath)) {
    try {
      const annotatorConfig = JSON.parse(fs.readFileSync(annotatorConfigPath, "utf-8"));
      annotatorConfig.currentPreset = targetConfig.presetId;
      fs.writeFileSync(annotatorConfigPath, JSON.stringify(annotatorConfig, null, 2), "utf-8");
      console.log(`✔ Set Visual Annotator default preset to \x1b[36m${targetConfig.presetFile}\x1b[0m`);
    } catch (e) {
      console.warn("Could not auto-update annotator.config.json:", e.message);
    }
  }

  // 3. Ensure Staging Directories Exist
  const dirsToEnsure = [
    path.join(rootDir, "inputs", "vision"),
    path.join(rootDir, "dist-preview"),
    path.join(rootDir, targetConfig.outputDir),
  ];

  dirsToEnsure.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log("\n=======================================================");
  console.log("🎉 Client project initialized successfully!");
  console.log(`Next step: Drop mockup images into inputs/vision/ and run 'npm run annotator'`);
  console.log("=======================================================\n");
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith("init-client.mjs")) {
  const args = process.argv.slice(2);
  let slug = null;
  let target = null;
  let name = null;
  let hasAcfPro = false;

  for (const arg of args) {
    if (arg.startsWith("--target=")) target = arg.split("=")[1];
    else if (arg.startsWith("--name=")) name = arg.split("=")[1];
    else if (arg.startsWith("--acf-pro=")) hasAcfPro = arg.split("=")[1] === "true";
    else if (arg === "--acf-pro") hasAcfPro = true;
    else if (!arg.startsWith("--") && !slug) slug = arg;
  }

  if (slug && target) {
    initClientProject({ clientSlug: slug, targetPlatform: target, clientName: name, hasAcfPro });
  } else {
    // Interactive prompt
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question("\n❓ Enter client project slug (e.g. skin-clinic, zara-bridal): ", (inputSlug) => {
      const chosenSlug = inputSlug.trim() || "client-project";

      console.log("\nChoose Target Platform Architecture:");
      const targetKeys = Object.keys(TARGET_PRESET_MAP);
      targetKeys.forEach((k, idx) => {
        console.log(`  [${idx + 1}] ${k.padEnd(20)} : ${TARGET_PRESET_MAP[k].name}`);
      });

      rl.question("\nEnter selection [1-6]: ", (choice) => {
        const num = parseInt(choice.trim(), 10);
        const selectedKey = (num >= 1 && num <= targetKeys.length) ? targetKeys[num - 1] : "nextjs-standalone";
        
        if (selectedKey === "wordpress-php") {
          rl.question("\n❓ Does the client have an active ACF Pro license? (y/N) [Default: N for Free ACF / Secure Custom Fields / OpenFields]: ", (acfAnswer) => {
            rl.close();
            const hasPro = acfAnswer.trim().toLowerCase() === "y" || acfAnswer.trim().toLowerCase() === "yes";
            initClientProject({ clientSlug: chosenSlug, targetPlatform: selectedKey, clientName: name, hasAcfPro: hasPro });
          });
        } else {
          rl.close();
          initClientProject({ clientSlug: chosenSlug, targetPlatform: selectedKey, clientName: name });
        }
      });
    });
  }
}
