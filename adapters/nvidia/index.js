// adapters/nvidia/index.js
// NVIDIA NIM Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://integrate.api.nvidia.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`NVIDIA NIM HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.data || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.filter(m => {
        if (!m.id) return false;
        const id = m.id.toLowerCase();
        if (id.includes('embed')) return false;
        if (id.includes('guard')) return false;
        if (id.includes('rerank')) return false;
        if (id.includes('deplot')) return false;
        if (id.includes('retriever')) return false;
        return true;
    });
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const id = (m.id || '').toLowerCase();
        const isVision = id.includes('vision') || id.includes('vlm') || id.includes('fuyu');
        const isTools = id.includes('instruct') || id.includes('chat');
        return createNormalizedModel({
            id: m.id,
            name: m.id,
            context_length: null,
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
