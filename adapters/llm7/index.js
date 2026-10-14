// adapters/llm7/index.js
// LLM7.io Provider Adapter (fetch, filter, normalize)

import { createNormalizedModel } from '../_normalize.js';

const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const PROXY_BASE = 'http://localhost:8081/proxy?url=';

export async function fetch(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    const targetUrl = IS_BROWSER
        ? PROXY_BASE + encodeURIComponent('https://api.llm7.io/v1/models')
        : 'https://api.llm7.io/v1/models';
    const res = await globalThis.fetch(targetUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LLM7 HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 100)}`);
    }
    const json = await res.json();
    return json.data || [];
}

export function filter(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.filter(m => m.model_type === 'chat');
}

export function normalize(filteredModels, storageAdapter, rawData) {
    return (filteredModels || []).map(m => {
        const inMods = m.modalities?.input || [];
        const isVision = inMods.includes('image') || inMods.includes('file') || !!m.capabilities?.vision;
        const isTools = !!m.tools_calling || !!m.capabilities?.tools;
        return createNormalizedModel({
            id: m.id,
            name: m.id,
            context_length: m.context_window?.tokens || null,
            max_completion_tokens: null,
            intelligence_index: null,
            coding_index: null,
            agentic_index: null,
            refusal_rate: null,
            has_files: isVision ? 1 : 0,
            has_tools: isTools ? 1 : 0,
            uptime: null,
            latency: null,
            raw_modalities: inMods.join(', ') || "text"
        });
    });
}
