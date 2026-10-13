// adapters/groq/index.js
// Groq Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.data || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.filter(m => {
        if (!m.id) return false;
        if (m.active === false) return false;
        const outMods = m.output_modalities || [];
        if (!outMods.includes('text')) return false;
        if (m.id.startsWith('whisper-')) return false;
        if (m.id.includes('prompt-guard') || m.id.includes('safeguard')) return false;
        if (m.id.includes('orpheus')) return false;
        return true;
    });
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const inMods = m.input_modalities || [];
        const hasFiles = inMods.includes('image') || inMods.includes('file') ? 1 : 0;
        const hasTools = 1;
        return createNormalizedModel({
            id: m.id,
            name: m.name || m.id,
            context_length: m.context_window || m.context_length || null,
            max_completion_tokens: m.max_completion_tokens || m.max_output_length || null,
            intelligence_index: null,
            coding_index: null,
            agentic_index: null,
            refusal_rate: null,
            has_files: hasFiles,
            has_tools: hasTools,
            uptime: null,
            latency: null,
            raw_modalities: inMods.join(', ') || "text"
        });
    });
}
