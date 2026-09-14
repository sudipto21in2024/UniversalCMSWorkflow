import fs from "fs";
import path from "path";
import readline from "readline";

/**
 * Workflow Step Tracker & State Checkpointer
 * Persists manifest data, node metadata, and step completion progress in .workflow-state.json
 */
export class WorkflowStepTracker {
  constructor({
    stateFilePath = ".workflow-state.json",
    interactive = true,
  } = {}) {
    this.rootDir = process.cwd();
    this.stateFilePath = path.isAbsolute(stateFilePath)
      ? stateFilePath
      : path.join(this.rootDir, stateFilePath);
    this.interactive = interactive;
    this.state = this.loadState();
  }

  /**
   * Initializes or loads existing state
   */
  loadState() {
    if (fs.existsSync(this.stateFilePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFilePath, "utf-8"));
      } catch (err) {
        console.warn(`[Step-Tracker] Corrupt state file. Initializing fresh state.`);
      }
    }

    return {
      workflowId: `wf-${Date.now()}`,
      status: "INITIALIZED",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      dumpMode: false,
      dumpPath: null,
      manifest: {
        fileKey: null,
        fileName: null,
        screens: [],
      },
      steps: {
        "step-1-parse-urls": {
          id: "step-1-parse-urls",
          title: "Figma URL & Manifest Parsing",
          status: "PENDING",
          outputs: {},
        },
        "step-2-extract-tokens": {
          id: "step-2-extract-tokens",
          title: "Design Token Extraction",
          status: "PENDING",
          outputs: {},
        },
        "step-3-sync-assets": {
          id: "step-3-sync-assets",
          title: "Shared Assets Download & Deduplication",
          status: "PENDING",
          outputs: {},
        },
        "step-4-generate-code": {
          id: "step-4-generate-code",
          title: "Component Registry & Multi-Page Code Generation",
          status: "PENDING",
          outputs: {},
        },
        "step-5-validate-build": {
          id: "step-5-validate-build",
          title: "Production Build & Visual Validation",
          status: "PENDING",
          outputs: {},
        },
        "step-6-export-client": {
          id: "step-6-export-client",
          title: "Standalone Client Export & Asset Tree-Shaking",
          status: "PENDING",
          outputs: {},
        },
      },
    };
  }

  /**
   * Saves state to disk
   */
  saveState() {
    this.state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), "utf-8");
  }

  /**
   * Sets or updates manifest and node information in state
   */
  setManifestInfo({ fileKey, fileName, screens = [] }) {
    if (fileKey) this.state.manifest.fileKey = fileKey;
    if (fileName) this.state.manifest.fileName = fileName;
    if (screens.length > 0) {
      this.state.manifest.screens = screens;
    }
    this.saveState();
  }

  /**
   * Updates specific screen node status
   */
  updateScreenNode(nodeId, updates = {}) {
    const screenIndex = this.state.manifest.screens.findIndex(
      (s) => s.nodeId === nodeId
    );
    if (screenIndex !== -1) {
      this.state.manifest.screens[screenIndex] = {
        ...this.state.manifest.screens[screenIndex],
        ...updates,
      };
      this.saveState();
    }
  }

  /**
   * Checks if a step is completed
   */
  isCompleted(stepId) {
    return this.state.steps[stepId]?.status === "COMPLETED";
  }

  /**
   * Marks a step as completed with output data
   */
  markCompleted(stepId, outputs = {}) {
    if (this.state.steps[stepId]) {
      this.state.steps[stepId].status = "COMPLETED";
      this.state.steps[stepId].completedAt = new Date().toISOString();
      this.state.steps[stepId].outputs = {
        ...this.state.steps[stepId].outputs,
        ...outputs,
      };
      this.state.status = "IN_PROGRESS";
      this.saveState();
      console.log(`\n✅ [Step-Tracker] Step Completed: ${this.state.steps[stepId].title}`);
    }
  }

  /**
   * Marks step as failed
   */
  markFailed(stepId, error) {
    if (this.state.steps[stepId]) {
      this.state.steps[stepId].status = "FAILED";
      this.state.steps[stepId].error = error?.message || String(error);
      this.state.status = "PAUSED_ON_ERROR";
      this.saveState();
      console.error(`\n❌ [Step-Tracker] Step Failed: ${this.state.steps[stepId].title} - ${error}`);
    }
  }

  /**
   * Prompts user with custom question and returns string
   */
  async promptQuestion(query, defaultVal = "") {
    if (!this.interactive) {
      return defaultVal;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      const suffix = defaultVal ? ` [default: ${defaultVal}]: ` : ": ";
      rl.question(`\n❓ ${query}${suffix}`, (answer) => {
        rl.close();
        const trimmed = answer.trim();
        resolve(trimmed || defaultVal);
      });
    });
  }

  /**
   * Interactive confirmation prompt before executing major steps
   */
  async promptConfirmation(stepTitle, { autoApprove = false } = {}) {
    if (!this.interactive || autoApprove) {
      return true;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(
        `\n👉 [Step Checkpoint] Proceed with "${stepTitle}"? [Y/n/q]: `,
        (answer) => {
          rl.close();
          const trimmed = answer.trim().toLowerCase();
          if (trimmed === "q") {
            console.log("[Step-Tracker] Workflow paused by user. You can resume anytime.");
            process.exit(0);
          }
          if (trimmed === "n") {
            resolve(false);
          } else {
            resolve(true); // Default Yes on enter or 'y'
          }
        }
      );
    });
  }

  /**
   * Prints a formatted status table of all steps and nodes
   */
  printStatus() {
    console.log("\n=======================================================");
    console.log(`📋 WORKFLOW STATUS: ${this.state.workflowId}`);
    console.log(`Status: ${this.state.status} | Last Updated: ${this.state.lastUpdated}`);
    console.log("=======================================================");

    if (this.state.manifest.fileKey) {
      console.log(`\n📁 Manifest File Key: ${this.state.manifest.fileKey}`);
      console.log(`Screens / Nodes (${this.state.manifest.screens.length}):`);
      for (const s of this.state.manifest.screens) {
        console.log(` - [${s.nodeId || "N/A"}] ${s.name || "Untitled"} -> ${s.targetRoute || "/"} (${s.status || "PENDING"})`);
      }
    }

    console.log("\n📌 Pipeline Steps:");
    for (const [id, step] of Object.entries(this.state.steps)) {
      const icon =
        step.status === "COMPLETED"
          ? "✅"
          : step.status === "FAILED"
          ? "❌"
          : step.status === "IN_PROGRESS"
          ? "🔄"
          : "⏳";
      console.log(` ${icon} [${step.status.padEnd(11)}] ${step.title}`);
    }
    console.log("=======================================================\n");
  }

  /**
   * Resets the entire state
   */
  reset() {
    if (fs.existsSync(this.stateFilePath)) {
      fs.unlinkSync(this.stateFilePath);
    }
    this.state = this.loadState();
    this.saveState();
    console.log("[Step-Tracker] Workflow state reset successfully.");
  }
}
