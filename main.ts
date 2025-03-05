import { parseCfg } from "./components/ParseCfg.ts";
import type { CfgObject } from "./components/ParseCfg.ts";
import {
  getProjectName,
  godot,
  platformToOutputFile,
} from "./components/Godot.ts";
import { parseArgs } from "@std/cli/parse-args";
import { join } from "jsr:@std/path";
import { exists } from "jsr:@std/fs/exists";
import { getCurrentYYYYMMDD } from "./components/DateHelper.ts";

const args = parseArgs(Deno.args);

async function main(): Promise<number> {
  let verifiedArgs;
  try {
    verifiedArgs = getVerifiedArgs();
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("Unknown error parsing arguments");
    }
    return 1;
  }

  // Make sure godot is installed and available.
  if (!await verifyGodot()) {
    return 1;
  }

  let projectName;
  try {
    projectName = await getProjectName(verifiedArgs.inputDir);
  } catch (e: unknown) {
    console.error("Unable to find project name");
    if (e instanceof Error) {
      console.error(e.message);
    }
    return 1;
  }

  // Load the export presets file.
  let config: CfgObject;
  try {
    config = await getExportPresets(verifiedArgs.inputDir);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("Unknown error");
    }
    return 1;
  }

  // Ask the user which preset(s) to compile.
  let index = 0;
  console.log(index, "all");
  const presets: CfgObject[] = [];
  for (const key in config) {
    index++;
    const preset = config[key] as CfgObject;
    presets.push(preset);
    console.log(index, preset["name"]);
  }
  const askIndex = prompt("Which index should we compile?");
  const indexToCompile = parseInt(askIndex ?? "-1");
  if (isNaN(indexToCompile) || indexToCompile < 0 || indexToCompile > index) {
    console.log("Invalid index");
    return 1;
  }
  const indicesToCompile: number[] = [];
  if (indexToCompile === 0) {
    for (let i = 0; i < index; i++) {
      indicesToCompile.push(i);
    }
  } else {
    indicesToCompile.push(indexToCompile - 1);
  }

  // Create the output directory.
  let outputDir;
  try {
    outputDir = await getOutputDir(verifiedArgs.outputDir);
  } catch (_e: unknown) {
    return 1;
  }
  console.log("Output directory:", outputDir);

  // Export the selected presets.
  for (const index of indicesToCompile) {
    const preset = presets[index];
    try {
      await exportGodotPreset(
        preset,
        verifiedArgs.inputDir,
        outputDir,
        projectName,
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        const presetName = preset["name"] as string;
        console.error("Unknown error during export", presetName);
      }
      return 1;
    }
  }

  return 0;
}

async function verifyGodot(): Promise<boolean> {
  console.log("Checking for godot...");
  try {
    const { stdout, stderr } = await godot(["--version"]);
    if (stderr) {
      console.error(stderr);
      return false;
    } else {
      console.log("godot version", stdout);
      return true;
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("Unknown error");
    }
    console.error("Please make sure godot is installed and in your PATH");
    console.error(
      "https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html#path",
    );
    return false;
  }
}

async function getExportPresets(inputDir: string): Promise<CfgObject> {
  const file = join(inputDir, "export_presets.cfg");
  if (!await exists(file)) {
    throw new Error("Export presets file not found: " + file);
  }
  const content = await Deno.readTextFile(file);
  return parseCfg(content, true);
}

async function exportGodotPreset(
  preset: CfgObject,
  inputDir: string,
  outputDir: string,
  projectName: string,
) {
  const presetName = preset["name"] as string;
  const platform = (preset["platform"] as string).replaceAll('"', "");
  console.log("Exporting preset", presetName);
  const fixedPresetName = presetName.replaceAll('"', "");
  const finalOutputDir = join(outputDir, fixedPresetName);
  const outputFileName = platformToOutputFile(
    projectName,
    platform,
  );
  const finalOutputFile = join(finalOutputDir, outputFileName);
  await Deno.mkdir(finalOutputDir);
  await godot([
    "--headless",
    "--path",
    inputDir,
    "--export-release",
    presetName,
    `"${finalOutputFile}"`,
  ]);
  console.log("Exported preset", presetName);
  console.log(finalOutputFile);
}

async function getOutputDir(rootOutputDir: string): Promise<string> {
  if (!await exists(rootOutputDir)) {
    console.log("Root output directory not found:", rootOutputDir);
    if (confirm("Create it?")) {
      await Deno.mkdir(rootOutputDir, { recursive: true });
    } else {
      throw "Root output directory not found";
    }
  }
  let version = 1;
  let outputDir = join(
    rootOutputDir,
    `${getCurrentYYYYMMDD()}.${String(version).padStart(2, "0")}`,
  );
  while (await exists(outputDir)) {
    version++;
    outputDir = join(
      rootOutputDir,
      `${getCurrentYYYYMMDD()}.${String(version).padStart(2, "0")}`,
    );
  }
  await Deno.mkdir(outputDir, { recursive: true });
  return outputDir;
}

function getVerifiedArgs(): { inputDir: string; outputDir: string } {
  const inputDir = args._.at(0) ?? ".";
  const outputDir = args["o"] ?? args["output"];
  if (!outputDir || typeof outputDir !== "string") {
    throw new Error("Output directory not specified, use -o or --output");
  }
  return {
    inputDir: String(inputDir),
    outputDir,
  };
}

if (import.meta.main) {
  main().then(Deno.exit);
}
