import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Standalone Client Exporter & Sanitizer
 * 
 * Packages a pure, decoupled Next.js web client into dist-client/ (or a specified target directory / zip)
 * with strict zero-residue guarantees:
 * - Tree-shakes public/figma-assets to ONLY include assets imported/referenced in active code.
 * - Strips all internal framework tooling, engine scripts, figma AST dumps, and dev notes.
 * - Sanitizes AST attributes (data-node-id, data-figma-*) and internal comment headers.
 * - Generates an isolated, production-ready package.json and README.
 */

export async function exportClient({
  outDir = "dist-client",
  clientName = "client-web-app",
  clientDescription = "Production Next.js 15 frontend delivered by Universal CMS Workflow",
  createZip = false,
} = {}) {
  const rootDir = process.cwd();
  const targetDir = path.isAbsolute(outDir) ? outDir : path.join(rootDir, outDir);

  console.log("\n=======================================================");
  console.log("   ZERO-RESIDUE STANDALONE CLIENT EXPORTER            ");
  console.log("=======================================================\n");
  console.log(`[Export-Engine] Packaging clean client distribution to: ${targetDir}`);

  const statePath = path.join(rootDir, ".workflow-state.json");
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf-8")) : {};
  const targetPlatform = state.client?.targetPlatform || "nextjs-tailwind";

  if (targetPlatform === "wordpress-php") {
    console.log(`[Export-Engine] Target Platform: WordPress Classic PHP Theme`);
    // Ensure Step 3 generated the theme
    const themeFiles = ["style.css", "functions.php", "index.php", "template-parts"];
    const hasTheme = themeFiles.every(f => fs.existsSync(path.join(targetDir, f)));
    if (!hasTheme) {
      console.log(`[Export-Engine] Synthesizing WordPress theme before packaging...`);
      execSync("node engine/scripts/generate-target-code.mjs", { stdio: "inherit" });
    }
    
    // Copy assets if present
    const assetsSrc = path.join(rootDir, "dist-preview/assets");
    if (fs.existsSync(assetsSrc)) {
      const assetsDest = path.join(targetDir, "assets");
      fs.cpSync(assetsSrc, assetsDest, { recursive: true });
      console.log(`[Export-Engine] Bundled client image assets into: assets/`);
    }

    // WordPress README
    const wpReadme = `# ${state.client?.name || "Skin-Clinic"} — WordPress Theme

Production-ready WordPress Classic Theme with Advanced Custom Fields (ACF Pro) / Secure Custom Fields (SCF) and WooCommerce support.

## Installation
1. Upload this entire folder to your WordPress installation under \`wp-content/themes/${state.client?.slug || "skin-clinic"}/\`.
2. Activate the theme via **Appearance > Themes**.
3. Install and activate **Advanced Custom Fields (ACF Pro)** or **Secure Custom Fields (SCF)**. Field groups in \`acf-json/\` will auto-sync.
4. (Optional) Install **WooCommerce** for e-commerce cart, checkout, and product management.
`;
    fs.writeFileSync(path.join(targetDir, "README.md"), wpReadme, "utf-8");

    if (createZip) {
      const zipName = `${(state.client?.slug || "wordpress-theme")}-theme.zip`;
      const zipPath = path.join(rootDir, zipName);
      console.log(`[Export-Engine] Compressing delivery archive: ${zipName}...`);
      if (process.platform === "win32") {
        execSync(`powershell -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${zipPath}' -Force"`);
      } else {
        execSync(`zip -r "${zipPath}" .`, { cwd: targetDir });
      }
      console.log(`[Export-Engine] ✅ Theme Zip ready at: ${zipPath}`);
    }

    console.log(`\n=======================================================`);
    console.log(`🎉 WordPress theme export completed successfully!`);
    console.log(`📁 Target Directory: ${targetDir}`);
    console.log(`=======================================================\n`);
    return { targetDir };
  }

  // 1. Clean / create target directory for Next.js
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 2. Scan and gather all source code files in src/
  function getCodeFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        files = files.concat(getCodeFiles(full));
      } else if (/\.(tsx|ts|jsx|js|css|json)$/i.test(item)) {
        files.push(full);
      }
    }
    return files;
  }

  const srcDir = path.join(rootDir, "src");
  const codeFiles = getCodeFiles(srcDir);
  const aggregatedCodeContent = codeFiles
    .map((f) => fs.readFileSync(f, "utf-8"))
    .join("\n");

  // 3. Recursive Copy & Sanitize for src/
  function copyAndSanitize(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const child of fs.readdirSync(src)) {
        copyAndSanitize(path.join(src, child), path.join(dest, child));
      }
    } else {
      let content = fs.readFileSync(src, "utf-8");
      // Sanitize engine comments and data-node-id / data-figma attributes
      if (/\.(tsx|ts|jsx|js|css)$/i.test(src)) {
        content = content
          .replace(/\/\/\s*token-ignore[^\n]*/g, "")
          .replace(/\/\*\s*figma-node-[^*]*\*\//g, "")
          .replace(/\s*data-node-id="[^"]*"/g, "")
          .replace(/\s*data-figma-[a-zA-Z0-9_-]+="[^"]*"/g, "");
      }
      fs.writeFileSync(dest, content);
    }
  }

  console.log(`[Export-Engine] Copying and sanitizing source code (src/)...`);
  copyAndSanitize(srcDir, path.join(targetDir, "src"));

  // 4. Selective Tree-Shaken Asset Copy (public/)
  console.log(`[Export-Engine] Tree-shaking and copying referenced assets (public/)...`);
  const publicDir = path.join(rootDir, "public");
  const destPublicDir = path.join(targetDir, "public");
  fs.mkdirSync(destPublicDir, { recursive: true });

  let totalAssetsFound = 0;
  let assetsBundled = 0;

  function copyReferencedAssets(dir, baseRel = "") {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(baseRel, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        copyReferencedAssets(fullPath, relPath);
      } else {
        totalAssetsFound++;
        const filename = path.basename(fullPath);
        // Include if referenced in code or if static root icon/favicon
        const isFaviconOrRoot = baseRel === "" && /\.(ico|svg|png|webmanifest)$/i.test(filename);
        if (isFaviconOrRoot || aggregatedCodeContent.includes(filename) || aggregatedCodeContent.includes(relPath.replace(/\\/g, "/"))) {
          const targetAssetPath = path.join(destPublicDir, relPath);
          fs.mkdirSync(path.dirname(targetAssetPath), { recursive: true });
          fs.copyFileSync(fullPath, targetAssetPath);
          assetsBundled++;
        }
      }
    }
  }

  copyReferencedAssets(publicDir);
  console.log(`[Export-Engine] Assets audit: ${assetsBundled} referenced assets bundled (dropped ${totalAssetsFound - assetsBundled} unreferenced).`);

  // 5. Copy necessary runtime configs only
  const runtimeConfigs = [
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.js",
    ".gitignore",
  ];

  for (const configFile of runtimeConfigs) {
    const srcPath = path.join(rootDir, configFile);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(targetDir, configFile));
      console.log(`[Export-Engine] Copied runtime configuration: ${configFile}`);
    }
  }

  // 6. Generate pure standalone package.json
  const sourcePkgPath = path.join(rootDir, "package.json");
  const sourcePkg = fs.existsSync(sourcePkgPath)
    ? JSON.parse(fs.readFileSync(sourcePkgPath, "utf-8"))
    : {};

  const cleanPackage = {
    name: clientName.toLowerCase().replace(/[^a-z0-9_-]+/g, "-"),
    version: "1.0.0",
    private: true,
    description: clientDescription,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      "@radix-ui/react-dialog": sourcePkg.dependencies?.["@radix-ui/react-dialog"] || "^1.1.6",
      "@radix-ui/react-dropdown-menu": sourcePkg.dependencies?.["@radix-ui/react-dropdown-menu"] || "^2.1.6",
      "@radix-ui/react-slot": sourcePkg.dependencies?.["@radix-ui/react-slot"] || "^1.1.2",
      "@radix-ui/react-tooltip": sourcePkg.dependencies?.["@radix-ui/react-tooltip"] || "^1.1.8",
      "class-variance-authority": sourcePkg.dependencies?.["class-variance-authority"] || "^0.7.1",
      clsx: sourcePkg.dependencies?.clsx || "^2.1.1",
      "lucide-react": sourcePkg.dependencies?.["lucide-react"] || "^0.475.0",
      next: sourcePkg.dependencies?.next || "^15.1.7",
      react: sourcePkg.dependencies?.react || "^19.0.0",
      "react-dom": sourcePkg.dependencies?.["react-dom"] || "^19.0.0",
      "tailwind-merge": sourcePkg.dependencies?.["tailwind-merge"] || "^3.0.1",
    },
    devDependencies: {
      "@tailwindcss/container-queries": sourcePkg.devDependencies?.["@tailwindcss/container-queries"] || "^0.1.1",
      "@types/node": sourcePkg.devDependencies?.["@types/node"] || "^22.13.4",
      "@types/react": sourcePkg.devDependencies?.["@types/react"] || "^19.0.8",
      "@types/react-dom": sourcePkg.devDependencies?.["@types/react-dom"] || "^19.0.3",
      autoprefixer: sourcePkg.devDependencies?.autoprefixer || "^10.5.4",
      eslint: sourcePkg.devDependencies?.eslint || "^9.20.1",
      "eslint-config-next": sourcePkg.devDependencies?.["eslint-config-next"] || "^15.1.7",
      postcss: sourcePkg.devDependencies?.postcss || "^8.5.2",
      tailwindcss: sourcePkg.devDependencies?.tailwindcss || "^3.4.17",
      typescript: sourcePkg.devDependencies?.typescript || "^5.7.3",
    },
  };

  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(cleanPackage, null, 2)
  );
  console.log(`[Export-Engine] Generated clean standalone package.json`);

  // 7. Generate clean Client README
  const clientReadme = `# ${clientName} — Web Application

${clientDescription}

## 🚀 Getting Started

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Production Build
\`\`\`bash
npm run build
npm start
\`\`\`
`;

  fs.writeFileSync(path.join(targetDir, "README.md"), clientReadme);
  console.log(`[Export-Engine] Generated clean README.md`);

  // 8. Optional ZIP Packaging
  if (createZip) {
    try {
      const zipName = `${cleanPackage.name}-delivery.zip`;
      const zipPath = path.join(rootDir, zipName);
      console.log(`[Export-Engine] Compressing delivery archive: ${zipName}...`);
      
      // Use powershell Compress-Archive on Windows
      if (process.platform === "win32") {
        execSync(`powershell -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${zipPath}' -Force"`);
      } else {
        execSync(`zip -r "${zipPath}" .`, { cwd: targetDir });
      }
      console.log(`[Export-Engine] ✅ Zip archive ready at: ${zipPath}`);
    } catch (err) {
      console.warn(`[Export-Engine] Zip creation note: ${err.message}`);
    }
  }

  console.log("\n=======================================================");
  console.log(`🎉 Client export completed successfully with ZERO residue!`);
  console.log(`📁 Target Directory: ${targetDir}`);
  console.log("=======================================================\n");

  return { targetDir, assetsBundled };
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith("export-client.mjs")) {
  const args = process.argv.slice(2);
  let outDir = "dist-client";
  let clientName = "client-web-app";
  
  const outArg = args.find((a) => a.startsWith("--out="));
  if (outArg) outDir = outArg.split("=")[1];

  const nameArg = args.find((a) => a.startsWith("--name="));
  if (nameArg) clientName = nameArg.split("=")[1];

  const createZip = args.includes("--zip");

  exportClient({ outDir, clientName, createZip });
}
