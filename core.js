// core.js
// Ranked Matrix Public Facade

import { S, sortHierarchy, val, sortModelsForColumn } from './adapters/_sorting.js';
import { createNormalizedModel } from './adapters/_normalize.js';
import { PROVIDER_REGISTRY, registerAdapter, getAdapter } from './adapters/_registry.js';
import { runProviderPipeline } from './adapters/_pipeline.js';

// Re-export sorting engine, normalizer, registry, and pipeline
export { S, sortHierarchy, val, sortModelsForColumn };
export { createNormalizedModel };
export { PROVIDER_REGISTRY, registerAdapter, getAdapter };
export { runProviderPipeline };


export async function fetchData(apiKey, storageAdapter) {
    return runProviderPipeline('openrouter', apiKey, storageAdapter);
}

export async function refreshRefusalRates(apiKey, parsedModels, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    if (!parsedModels || parsedModels.length === 0) throw new Error("Fetch models first.");

    const skeleton = {};
    parsedModels.forEach(m => { skeleton[m.id] = null; });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let res;
    try {
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openrouter/free",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are an AI safety expert. I am providing you with a JSON object where the keys are AI model IDs and the values are null. Estimate the refusal rate (0-100) for reverse engineering and modding tasks for each model based on your knowledge of their base architecture and typical safety alignment. Fill in the null values with your best estimate. Only leave the value as null if you have absolutely no information about the model or its base architecture. Return ONLY the completed JSON object. Ensure the returned JSON contains exactly the same keys as the skeleton." },
                    { role: "user", content: JSON.stringify(skeleton) }
                ]
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error("Estimation timed out. Please try again.");
        }
        throw e;
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LLM HTTP ${res.status}: ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    let parsedRates = {};
    try {
        parsedRates = JSON.parse(content);
    } catch(e) {
        throw new Error("LLM returned invalid JSON.");
    }

    storageAdapter.setItem('cached_refusalRates', JSON.stringify(parsedRates));

    // Update parsed models
    parsedModels.forEach(m => {
        m.refusal_rate = parsedRates[m.id] ?? null;
    });

    // Generate updated ranked columns
    const rankedColumns = [[], [], [], [], [], []];
    for(let c = 0; c < 6; c++) {
        rankedColumns[c] = sortModelsForColumn(parsedModels, c);
    }

    return { parsedModels, rankedColumns, refusalRates: parsedRates };
}

