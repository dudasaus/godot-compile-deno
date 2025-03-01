import { parseCfg } from "./components/ParseCfg.ts";
import type { CfgObject } from "./components/ParseCfg.ts";
import { godot } from "./components/Godot.ts";
import { parseArgs } from "@std/cli/parse-args";
import path from "node:path";
import { exists } from "jsr:@std/fs/exists";


async function main(): Promise<number> {
  if (!await verifyGodot()) {
    return 1;
  }
  let config: CfgObject 
  try {
   config = await getExportPresets();
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error('Unknown error');
    }
    return 1;
  }
  let index = 0;
  console.log(index, "all");
  for (const key in config) {
    index++;
    const preset = config[key] as CfgObject;
    console.log(index, preset['name']);
  }
  const askIndex = prompt('Which index should we compile?');
  const indexToCompile = parseInt(askIndex!);
  if (isNaN(indexToCompile) || indexToCompile < 0 || indexToCompile > index) {
    console.log('Invalid index');
    return 1;
  }

  return 0;
}

async function verifyGodot(): Promise<boolean> {
  console.log('Checking for godot...');
  try {
    const {stdout, stderr} = await godot(['--version']);
    if (stderr) {
      console.error(stderr);
      return false;
    } else {
      console.log('godot version', stdout);
      return true;
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error('Unknown error');
    }
    console.error('Please make sure godot is installed and in your PATH');
    console.error('https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html#path');
    return false;
  }
}

async function getExportPresets(): Promise<CfgObject> {
  const args = parseArgs(Deno.args);
  const dir = args._.at(0) ?? '.';
  const file = path.join(String(dir), 'export_presets.cfg');
  if (!await exists(file)) {
    throw new Error('Export presets file not found: ' + file);
  }
  const content = await Deno.readTextFile('export_presets.cfg');
  return parseCfg(content, true);
}


if (import.meta.main) {
  main().then(Deno.exit);
}
