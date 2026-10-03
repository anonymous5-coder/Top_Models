#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { fetchData, refreshRefusalRates } from './core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');

// Storage adapter for CLI
const storageAdapter = {
    getItem: (key) => {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return config[key];
        } catch(e) { return null; }
    },
    setItem: (key, val) => {
        let config = {};
        try { config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch(e) {}
        config[key] = val;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    }
};

const getApiKey = () => {
    const key = storageAdapter.getItem('openRouterApiKey');
    if (!key) {
        console.error("Error: No API key found. Please run 'models keys <your-key>' first.");
        process.exit(1);
    }
    return key;
};

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log(`Usage: models <command>
Commands:
  keys <key>        Save OpenRouter API key
  refresh           Fetch dashboard data and cache it
  estimate          Run refusal rate estimation via LLM
  fetch             Copy the current ranked data JSON to clipboard
`);
    process.exit(0);
}

switch(command) {
    case 'keys':
        if (!args[1]) {
            console.error("Error: Please provide the key.");
            process.exit(1);
        }
        storageAdapter.setItem('openRouterApiKey', args[1]);
        console.log("API Key saved successfully.");
        break;

    case 'refresh':
        (async () => {
            try {
                console.log("Fetching latest dashboard data...");
                const res = await fetchData(getApiKey(), storageAdapter);
                storageAdapter.setItem('cached_rankedColumns', JSON.stringify(res.rankedColumns));
                storageAdapter.setItem('cached_parsedModels', JSON.stringify(res.parsedModels));
                console.log("Data refreshed successfully. Use 'top-models fetch' to copy JSON.");
            } catch (e) {
                console.error("Error refreshing data:", e.message);
            }
        })();
        break;

    case 'estimate':
        (async () => {
            try {
                const parsedModelsStr = storageAdapter.getItem('cached_parsedModels');
                if (!parsedModelsStr) {
                    console.error("Error: No parsed models found. Please run 'top-models refresh' first.");
                    process.exit(1);
                }
                const parsedModels = JSON.parse(parsedModelsStr);
                
                console.log("Estimating refusal rates with LLM...");
                const res = await refreshRefusalRates(getApiKey(), parsedModels, storageAdapter);
                storageAdapter.setItem('cached_rankedColumns', JSON.stringify(res.rankedColumns));
                storageAdapter.setItem('cached_parsedModels', JSON.stringify(res.parsedModels));
                console.log("Refusal rates updated successfully. Use 'top-models fetch' to copy JSON.");
            } catch (e) {
                console.error("Error estimating refusal rates:", e.message);
            }
        })();
        break;

    case 'fetch':
        const data = storageAdapter.getItem('cached_rankedColumns');
        if (!data) {
            console.error("Error: No data found. Please run 'top-models refresh' first.");
            process.exit(1);
        }
        exec(`echo '${data.replace(/'/g, "'\\''")}' | termux-clipboard-set`, (error) => {
            if (error) {
                console.error("Error copying to clipboard (make sure termux-api is installed):", error.message);
            } else {
                console.log("Ranked data JSON successfully copied to clipboard!");
            }
        });
        break;

    default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
}
