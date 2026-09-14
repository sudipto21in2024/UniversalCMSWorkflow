// scripts/reporter.mjs

export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

export const badges = {
  success: `${colors.green}${colors.bold}✔ SUCCESS${colors.reset}`,
  error: `${colors.red}${colors.bold}✖ ERROR${colors.reset}`,
  warn: `${colors.yellow}${colors.bold}⚠ WARNING${colors.reset}`,
  info: `${colors.cyan}${colors.bold}ℹ INFO${colors.reset}`,
  step: (curr, total) => `${colors.blue}${colors.bold}[${curr}/${total}]${colors.reset}`,
  drift: `${colors.red}${colors.bold}❌ DRIFT DETECTED${colors.reset}`,
  pass: `${colors.green}${colors.bold}✔ PASS${colors.reset}`,
  fail: `${colors.red}${colors.bold}✖ FAIL${colors.reset}`,
};

export function printHeader(title, subtitle = "") {
  const line = "═".repeat(64);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.bold}${colors.white}  ${title.toUpperCase()}${colors.reset}`);
  if (subtitle) {
    console.log(`${colors.dim}  ${subtitle}${colors.reset}`);
  }
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

export function printStep(current, total, title, detail = "") {
  console.log(`${badges.step(current, total)} ${colors.bold}${title}${colors.reset}`);
  if (detail) {
    console.log(`    ${colors.dim}↳ ${detail}${colors.reset}`);
  }
}

export function printSuccess(message) {
  console.log(`\n${badges.success} ${colors.green}${message}${colors.reset}\n`);
}

export function printWarning(message) {
  console.log(`${badges.warn} ${colors.yellow}${message}${colors.reset}`);
}

export function printInfo(message) {
  console.log(`${badges.info} ${colors.cyan}${message}${colors.reset}`);
}

export function printErrorBanner({ title = "Command Failed", message, context, fix, details }) {
  const line = "─".repeat(64);
  console.error(`\n${colors.red}${colors.bold}┌${line}┐${colors.reset}`);
  console.error(`${colors.red}${colors.bold}│ ✖ ERROR: ${title.padEnd(54)} │${colors.reset}`);
  console.error(`${colors.red}${colors.bold}├${line}┤${colors.reset}`);

  if (message) {
    const cleanMsg = String(message).replace(/\r?\n/g, " ");
    const chunks = cleanMsg.match(/.{1,52}/g) || [cleanMsg];
    console.error(`${colors.red}│ ${colors.bold}Message:${colors.reset} ${chunks[0].padEnd(53)} │${colors.reset}`);
    for (let i = 1; i < chunks.length && i < 4; i++) {
      console.error(`${colors.red}│          ${chunks[i].padEnd(53)} │${colors.reset}`);
    }
  }

  if (context) {
    const cleanCtx = String(context).replace(/\r?\n/g, " ");
    console.error(`${colors.yellow}│ ${colors.bold}Context:${colors.reset} ${cleanCtx.slice(0, 52).padEnd(53)} │${colors.reset}`);
  }

  if (fix) {
    const cleanFix = String(fix).replace(/\r?\n/g, " ");
    const chunks = cleanFix.match(/.{1,52}/g) || [cleanFix];
    console.error(`${colors.cyan}│ ${colors.bold}Fix:    ${colors.reset} ${chunks[0].padEnd(53)} │${colors.reset}`);
    for (let i = 1; i < chunks.length && i < 4; i++) {
      console.error(`${colors.cyan}│          ${chunks[i].padEnd(53)} │${colors.reset}`);
    }
  }

  if (details && typeof details === "object") {
    console.error(`${colors.dim}├${line}┤${colors.reset}`);
    Object.entries(details).forEach(([k, v]) => {
      const str = `${k}: ${v}`;
      console.error(`${colors.dim}│ • ${str.slice(0, 60).padEnd(60)} │${colors.reset}`);
    });
  }

  console.error(`${colors.red}${colors.bold}└${line}┘${colors.reset}\n`);
}

export function printSummaryCard(title, items = []) {
  const line = "─".repeat(64);
  console.log(`\n${colors.dim}┌${line}┐${colors.reset}`);
  console.log(`${colors.bold}│ ${title.padEnd(62)} │${colors.reset}`);
  console.log(`${colors.dim}├${line}┤${colors.reset}`);
  items.forEach(([label, value]) => {
    console.log(`│ ${colors.cyan}${label.padEnd(20)}${colors.reset}: ${String(value).padEnd(40)} │`);
  });
  console.log(`${colors.dim}└${line}┘${colors.reset}\n`);
}

export default {
  colors,
  badges,
  printHeader,
  printStep,
  printSuccess,
  printWarning,
  printInfo,
  printErrorBanner,
  printSummaryCard,
};
