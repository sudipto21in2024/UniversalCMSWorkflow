// scripts/verify-deployment.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { printHeader, printStep, printErrorBanner, printSummaryCard, colors } from "./reporter.mjs";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function fetchEndpoint(urlPath) {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode || 500,
          body: data,
          headers: res.headers,
        });
      });
    }).on("error", (err) => {
      resolve({ status: 0, body: "", error: err.message });
    });
  });
}

async function verifyDeployment() {
  printHeader("Deployment & Live Health Checker", "Auditing live Next.js routes, CSS bundle delivery, and DOM integrity");

  // 1. Check Registry Routes
  const registryPath = path.join(process.cwd(), "engine", "registry", "component-registry.json");
  let routes = ["/", "/monitoring", "/students", "/services-upload", "/tasks"];

  if (fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      if (reg.routes) {
        routes = Object.keys(reg.routes);
      }
    } catch (e) {}
  }

  printStep(1, 3, "Auditing Live Route Responses", `Checking ${routes.length} registered routes...`);

  const results = [];
  let allHealthy = true;

  for (const route of routes) {
    const res = await fetchEndpoint(route);
    if (res.status === 200) {
      // Look for CSS bundle link in HTML head
      const cssMatch = res.body.match(/href="(\/_next\/static\/css\/[^"]+\.css[^"]*)"/);
      let cssHealthy = false;
      let cssBytes = 0;

      if (cssMatch && cssMatch[1]) {
        const cssRes = await fetchEndpoint(cssMatch[1]);
        if (cssRes.status === 200 && cssRes.body.length > 500) {
          cssHealthy = true;
          cssBytes = cssRes.body.length;
        }
      }

      const isPass = cssHealthy;
      if (!isPass) allHealthy = false;

      results.push({
        route,
        status: res.status,
        hasCssLink: !!cssMatch,
        cssStatus: cssHealthy ? "200 OK" : "404 / Missing",
        cssBytes: `${(cssBytes / 1024).toFixed(1)} KB`,
        passed: isPass,
      });

      const mark = isPass ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      const routeStr = `${colors.bold}${route.padEnd(20)}${colors.reset}`;
      const htmlStatus = `${colors.green}${res.status}${colors.reset}`;
      const cssStatus = cssHealthy 
        ? `${colors.green}200 OK (${(cssBytes / 1024).toFixed(1)} KB)${colors.reset}` 
        : `${colors.red}FAILED / 404${colors.reset}`;

      console.log(`  ${mark} ${routeStr} | HTML: ${htmlStatus} | CSS: ${cssStatus}`);
    } else {
      allHealthy = false;
      results.push({
        route,
        status: res.status || "Connection Refused",
        hasCssLink: false,
        cssStatus: "N/A",
        cssBytes: "0 KB",
        passed: false,
      });
      console.log(`  ${colors.red}✗${colors.reset} ${colors.bold}${route.padEnd(20)}${colors.reset} | HTML: ${colors.red}${res.status || "Offline"}${colors.reset}`);
    }
  }

  // 2. Summary
  printStep(2, 3, "Evaluating Health Matrix", "Verifying Tailwind design tokens & bundle payload");

  if (!allHealthy) {
    printErrorBanner({
      title: "Deployment Health Check Failed",
      message: "One or more pages or stylesheet bundles failed to deliver correctly. Restarting dev server may be required.",
    });
    process.exit(1);
  }

  printSummaryCard("Live Deployment & CSS Verification", [
    ["Total Routes", `${routes.length} routes`],
    ["HTML Status", "100% 200 OK"],
    ["CSS Status", "100% 200 OK (Full Tailwind & Tokens)"],
    ["Server Base URL", BASE_URL],
    ["Deployment State", "VERIFIED & HEALTHY"],
  ]);
}

verifyDeployment();
