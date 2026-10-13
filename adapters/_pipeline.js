// adapters/_pipeline.js
// Universal Pipeline Coordinator (fetch -> filter -> normalize -> rank)

import { sortModelsForColumn } from './_sorting.js';
import { getAdapter, PROVIDER_REGISTRY } from './_registry.js';

export async function runProviderPipeline(providerId, apiKey, storageAdapter) {
    const meta = PROVIDER_REGISTRY[providerId];
    if (!meta) {
        throw new Error(`Unknown provider: ${providerId}`);
    }

    const adapter = getAdapter(providerId);
    if (!adapter) {
        throw new Error(`Adapter for provider '${providerId}' is not yet registered.`);
    }

    // 1. Fetch raw payload
    const rawData = await adapter.fetch(apiKey, storageAdapter);

    // 2. Filter candidate models
    const filteredModels = adapter.filter(rawData);

    // 3. Normalize into NormalizedModel instances
    const parsedModels = adapter.normalize(filteredModels, storageAdapter);

    // 4. Hierarchical Ranking across columns 0..5
    const rankedColumns = [[], [], [], [], [], []];
    for (let c = 0; c < 6; c++) {
        rankedColumns[c] = sortModelsForColumn(parsedModels, c);
    }

    return { parsedModels, rankedColumns };
}
