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

export function filter(normalizedModels) {
    return (normalizedModels || []).filter(m => m.is_chat === true && m.free !== false);
}

export function normalize(rawData, storageAdapter) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.models || []);
    return list.map(m => {
        const cleanId = (m.name || '').replace(/^models\//, '');
        const methods = m.supportedGenerationMethods || [];
        const isChat = methods.includes('generateContent');

        const isGemini = cleanId.toLowerCase().startsWith('gemini-');
        const hasFiles = isGemini ? 1 : 0;
        const hasTools = null;
        const rawModalities = isGemini ? "text, image, audio, video" : "text";

        return createNormalizedModel({
            id: cleanId,
            name: m.displayName || cleanId,
            context_length: m.inputTokenLimit || null,
            max_completion_tokens: m.outputTokenLimit || null,
            intelligence_index: null,
            coding_index: null,
            agentic_index: null,
            refusal_rate: null,
            has_files: hasFiles,
            has_tools: hasTools,
            uptime: null,
            latency: null,
            raw_modalities: rawModalities,
            free: null,
            is_chat: isChat
        });
    });
}
