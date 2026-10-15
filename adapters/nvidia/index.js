// adapters/nvidia/index.js
// NVIDIA NIM Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const PROXY_BASE = 'http://localhost:8081/proxy?url=';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const targetUrl = IS_BROWSER
        ? PROXY_BASE + encodeURIComponent('https://integrate.api.nvidia.com/v1/models')
        : 'https://integrate.api.nvidia.com/v1/models';
    const res = await globalThis.fetch(targetUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`NVIDIA NIM HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
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
        const id = (m.id || '').toLowerCase();
        const isChat = !!m.id
            && !id.includes('embed')
            && !id.includes('guard')
            && !id.includes('rerank')
            && !id.includes('deplot')
            && !id.includes('retriever');
        const isVision = id.includes('vision') || id.includes('vlm') || id.includes('fuyu');
        const isTools = id.includes('instruct') || id.includes('chat') ? 1 : 0;
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
            has_tools: isTools,
            uptime: null,
            latency: null,
            raw_modalities: isVision ? "text, image" : "text",
            free: null,
            is_chat: isChat
        });
    });
}
