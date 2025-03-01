# Godot Export Tool

A tool to export one or all of your Godot project's export presets.

## Usage

```bash
godot-export tool path/to/my/godot/project -o /path/to/my/output/directory
```

- Reads `project.godot` and `export_presets.cfg` from your project directory.
- Creates versioned output directory, `YYYYMMDD.NN`, where `NN` is the next
  available version number.
- Creates the preset output folder(s).
- Exports the project.

## Example

```bash
dudas@ADLegion2025 MINGW64 ~/Documents/godot-compile-deno (main)
$ godot-export-tool.exe ~/Documents/diezee/ -o ~/Documents/game-exports/diezee-test
Checking for godot...
godot version 4.3.stable.official.77dcf97d8

0 all
1 "Web"
2 "Web - Itch.io"
3 "Web - GameJolt"
4 "Web - Dicetro.com"
5 "Windows Desktop"
6 "Windows Desktop - Itch.io"
7 "Windows Desktop - GameJolt"
8 "Web, Staging - Dicetro.com"
Which index should we compile? 4
Root output directory not found: C:/Users/dudas/Documents/game-exports/diezee-test
Create it? [y/N] y
Output directory: C:\Users\dudas\Documents\game-exports\diezee-test\20250301.01
Exporting preset "Web - Dicetro.com"
Exported preset "Web - Dicetro.com"
C:\Users\dudas\Documents\game-exports\diezee-test\20250301.01\Web - Dicetro.com\index.html
```

## Compile

Requires [Deno](https://deno.com/).

```bash
deno task compile
```

Creates the executable, `godot-export-tool`

Recommended to add to `$PATH`
