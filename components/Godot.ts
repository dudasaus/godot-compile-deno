import { join } from "jsr:@std/path";

import { CfgObject, parseCfg } from "./ParseCfg.ts";

export async function godot(commandArgs: string[]) {
  const textDecoder = new TextDecoder();
  const command = new Deno.Command("godot", {
    args: commandArgs,
  });
  const results = await command.output();
  return {
    code: results.code,
    stdout: textDecoder.decode(results.stdout),
    stderr: textDecoder.decode(results.stderr),
  };
}

export async function getProjectName(inputDir: string): Promise<string> {
  const projectFile = join(inputDir, "project.godot");
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
