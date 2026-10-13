// adapters/mistral/index.js
// Mistral Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Mistral HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.data || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.filter(m => m.capabilities?.completion_chat === true);
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const caps = m.capabilities || {};
        const isVision = !!caps.vision;
        const isTools = !!caps.function_calling;
        return createNormalizedModel({
            id: m.id,
            name: m.name || m.id,
            context_length: m.max_context_length || null,
            max_completion_tokens: null,
            intelligence_index: null,
            coding_index: null,
            agentic_index: null,
            refusal_rate: null,
            has_files: isVision ? 1 : 0,
            has_tools: isTools ? 1 : 0,
            uptime: null,
            latency: null,
            raw_modalities: isVision ? "multimodal (text, image)" : "text"
        });
    });
}
