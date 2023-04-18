#!/usr/bin/env node
import { writeFile, readdir } from "fs";
import { join } from "path";
import { render } from "node-sass";
import { watch } from "chokidar";

// Function to compile SASS/SCSS to CSS
function compileSassToCss(sassFile) {
  render(
    {
      file: sassFile,
      outFile: sassFile.replace(/\.(sass|scss)$/, ".css"),
    },
    (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      // Write the CSS output to a file with the same name
      const cssFile = sassFile.replace(/\.(sass|scss)$/, ".css");
      writeFile(cssFile, result.css, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Compiled ${sassFile} to ${cssFile}`);
      });
    }
  );
}

// Function to find and compile all SASS/SCSS files in a directory and its subdirectories
function findAndCompileSassFiles(dir) {
  readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    files.forEach((file) => {
      const fullPath = join(dir, file.name);
      if (file.isDirectory()) {
        // Skip the node_modules directory
        if (file.name === "node_modules") {
          return;
        }
        // Recursively search for SASS/SCSS files in subdirectories
        findAndCompileSassFiles(fullPath);
      } else if (file.isFile() && /\.(sass|scss)$/.test(file.name)) {
        // Compile SASS/SCSS files
        compileSassToCss(fullPath);
      }
    });
  });
}

// Start by finding and compiling all SASS/SCSS files in the current directory
const rootDir = process.cwd();
findAndCompileSassFiles(rootDir);

// Watch for changes in SASS/SCSS files and recompile them when they change
// Ignore files and directories within the node_modules directory
const watcher = watch("**/*.{sass,scss}", {
  cwd: rootDir,
  ignored: "**/node_modules/**",
});
watcher.on("change", (filePath) => {
  const fullPath = join(rootDir, filePath);
  compileSassToCss(fullPath);
});

console.log("Watching for changes in SASS/SCSS files...");
