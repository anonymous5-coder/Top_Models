// adapters/modelscope/index.js
// ModelScope Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const res = await globalThis.fetch('https://api-inference.modelscope.cn/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`ModelScope HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
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
        const lowerId = (m.id || '').toLowerCase();
        const isChat = !!m.id && !lowerId.includes('image-edit');
        const isVision = lowerId.includes('vl') || lowerId.includes('vision');
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
            has_tools: null,
            uptime: null,
            latency: null,
            raw_modalities: isVision ? "text, image" : "text",
            free: null,
            is_chat: isChat
        });
    });
}
