// adapters/cohere/index.js
// Cohere Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://api.cohere.com/v2/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cohere HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.models || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.models || []);
    return list.filter(m => {
        if (!m.name) return false;
        const endpoints = m.endpoints || [];
        return endpoints.includes('chat') || endpoints.includes('generate');
    });
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const feats = m.features || [];
        const isVision = feats.includes('vision');
        const isTools = feats.includes('tools');
        return createNormalizedModel({
            id: m.name,
            name: m.name,
            context_length: m.context_length || null,
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
