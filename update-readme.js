import fs from 'fs';

const readmeStr = fs.readFileSync('README.md', 'utf-8');
const extensionFilesStr = fs.readFileSync('src/extension-files.ts', 'utf-8');

const targetObjExportStart = 'export const readmeMD = `';
const targetStartIdx = extensionFilesStr.indexOf(targetObjExportStart);

if (targetStartIdx === -1) {
    console.error("Could not find start");
    process.exit(1);
}

const safeReadmeStr = readmeStr.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

const newExtensionFileStr = extensionFilesStr.substring(0, targetStartIdx + 'export const readmeMD = `'.length) + safeReadmeStr + '`;\n';

fs.writeFileSync('src/extension-files.ts', newExtensionFileStr);
console.log("src/extension-files.ts updated successfully");
