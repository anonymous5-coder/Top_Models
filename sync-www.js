/**
 * Re-run this after regenerating refusal_rates.json.
 * 
 * This script synchronizes the source web files into the 'www' directory
 * for Capacitor builds. It intentionally excludes 'sw.js' because 
 * Service Workers are unreliable inside Capacitor's native local server.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wwwDir = path.join(__dirname, 'www');

// Define files to copy
const filesToCopy = [
    'index.html',
    'core.js',
    'manifest.json',
    'icon.svg'
];

// Check if refusal_rates.json exists and optionally include it
const refusalRatesPath = path.join(__dirname, 'refusal_rates.json');
if (fs.existsSync(refusalRatesPath)) {
    filesToCopy.push('refusal_rates.json');
}

// Ensure www directory exists (delete if it does, then recreate)
if (fs.existsSync(wwwDir)) {
    fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir);

// Copy each file
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(wwwDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to www/`);
    } else {
        console.warn(`Warning: Source file ${file} not found.`);
    }
});

console.log('Synchronization to www/ complete.');
