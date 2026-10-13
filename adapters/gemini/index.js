// adapters/gemini/index.js
// Google Gemini Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
        headers: { 'x-goog-api-key': apiKey }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.models || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.models || []);
    return list.filter(m => {
        const methods = m.supportedGenerationMethods || [];
        return methods.includes('generateContent');
    });
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const cleanId = (m.name || '').replace(/^models\//, '');
        return createNormalizedModel({
            id: cleanId,
            name: m.displayName || cleanId,
            context_length: m.inputTokenLimit || null,
            max_completion_tokens: m.outputTokenLimit || null,
            intelligence_index: null,
            coding_index: null,
            agentic_index: null,
            refusal_rate: null,
            has_files: 1,
            has_tools: 1,
            uptime: null,
            latency: null,
            raw_modalities: "multimodal (text, image, audio, video)"
        });
    });
}
