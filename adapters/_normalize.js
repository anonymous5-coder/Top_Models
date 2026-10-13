// adapters/_normalize.js
// Canonical Factory for NormalizedModel objects

export function createNormalizedModel({
    id,
    name = id,
    context_length = null,
    max_completion_tokens = null,
    intelligence_index = null,
    coding_index = null,
    agentic_index = null,
    refusal_rate = null,
    has_files = 0,
    has_tools = 0,
    uptime = null,
    latency = null,
    raw_modalities = "text"
}) {
    return {
        id,
        name: name || id,
        context_length: context_length !== undefined ? context_length : null,
        max_completion_tokens: max_completion_tokens !== undefined ? max_completion_tokens : null,
        intelligence_index: intelligence_index !== undefined ? intelligence_index : null,
        coding_index: coding_index !== undefined ? coding_index : null,
        agentic_index: agentic_index !== undefined ? agentic_index : null,
        refusal_rate: refusal_rate !== undefined ? refusal_rate : null,
        has_files: has_files ? 1 : 0,
        has_tools: has_tools ? 1 : 0,
        uptime: uptime !== undefined ? uptime : null,
        latency: latency !== undefined ? latency : null,
        raw_modalities: raw_modalities || "text"
    };
}
