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

export function filter(normalizedModels) {
    return (normalizedModels || []).filter(m => m.is_chat === true && m.free !== false);
}

export function normalize(rawData, storageAdapter) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.map(m => {
        const inMods = m.input_modalities || [];
        const outMods = m.output_modalities || [];
        const id = m.id || '';
        const isChat = !!m.id
            && m.active !== false
            && outMods.includes('text')
            && !id.startsWith('whisper-')
            && !id.includes('prompt-guard')
            && !id.includes('safeguard')
            && !id.includes('orpheus');

        const hasFiles = inMods.includes('image') || inMods.includes('file') ? 1 : 0;
        const feats = m.supported_features || [];
        const hasTools = feats.includes('tools') ? 1 : 0;

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
            raw_modalities: inMods.map(x => x.toLowerCase()).join(', ') || "text",
            free: null,
            is_chat: isChat
        });
    });
}
