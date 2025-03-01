import { exec as childProcessExec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { CfgObject, parseCfg } from "./ParseCfg.ts";

const exec = promisify(childProcessExec);

export async function godot(commandArgs: string[]) {
  const results = await exec(`godot ${commandArgs.join(" ")}`);
  return results;
}

export async function getProjectName(inputDir: string): Promise<string> {
  const projectFile = path.join(inputDir, "project.godot");
  const projectContent = await Deno.readTextFile(projectFile);
  const config = parseCfg(projectContent);
  const app = config["application"] as CfgObject;
  return String(app["config/name"]).replaceAll('"', "");
}

const platformToFileExtension: Record<string, string> = {
  "Windows Desktop": "exe",
  "Web": "html",
};

export function platformToOutputFile(projectName: string, platform: string) {
  const extension = platformToFileExtension[platform];
  if (!extension) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  if (platform === "Web") {
    projectName = "index";
  }
  return `${projectName}.${extension}`;
}
