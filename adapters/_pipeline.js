// adapters/_pipeline.js
// Universal Pipeline Coordinator (fetch -> normalize -> filter -> rank)

import { sortModelsForColumn } from './_sorting.js';
import { getAdapter, PROVIDER_REGISTRY } from './_registry.js';

export async function runProviderPipeline(providerId, apiKey, storageAdapter) {
    const meta = PROVIDER_REGISTRY[providerId];
    if (!meta) {
        throw new Error(`Unknown provider: ${providerId}`);
    }

    const adapter = getAdapter(providerId) || meta.adapter;
    if (!adapter) {
        throw new Error(`Adapter for provider '${providerId}' is not yet registered.`);
    }

    // 1. Fetch raw payload
    const rawData = await adapter.fetch(apiKey, storageAdapter);

    // 2. Normalize into NormalizedModel instances (all models)
    const normalizedModels = await adapter.normalize(rawData, storageAdapter);

    // Persist rich models before display filtering
    if (storageAdapter) {
        try {
            storageAdapter.setItem('cached_richModels_' + providerId, JSON.stringify(normalizedModels));
        } catch (e) {
            console.warn('Failed to cache rich models (quota?):', e);
        }
    } else if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem('cached_richModels_' + providerId, JSON.stringify(normalizedModels));
        } catch (e) {
            console.warn('Failed to cache rich models (quota?):', e);
        }
    }

    // 3. Filter display models
    const filteredModels = adapter.filter(normalizedModels);

    // 4. Hierarchical Ranking across columns 0..5
    const rankedColumns = [[], [], [], [], [], []];
    for (let c = 0; c < 6; c++) {
        rankedColumns[c] = sortModelsForColumn(filteredModels, c);
    }

    let refusalRates = normalizedModels.refusalRates || filteredModels.refusalRates || {};
    if (Object.keys(refusalRates).length === 0 && storageAdapter) {
        const cachedRates = storageAdapter.getItem('cached_refusalRates');
        if (cachedRates) {
            try { refusalRates = JSON.parse(cachedRates); } catch (e) {}
        }
    }

    return { parsedModels: filteredModels, rankedColumns, refusalRates };
}
