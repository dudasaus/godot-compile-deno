import { exec as childProcessExec } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(childProcessExec);

export async function godot(commandArgs: string[]) {
  const results = await exec(`godot ${commandArgs.join(' ')}`);
  return results;
}
