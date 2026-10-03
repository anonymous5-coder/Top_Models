// core.js
// Extracted Ranked Matrix Core Logic

export const S = {
    ctx: 'context_length',
    out: 'max_completion_tokens',
    intel: 'intelligence_index',
    code: 'coding_index',
    agent: 'agentic_index',
    refuse: 'refusal_rate',
    file: 'has_files',
    tool: 'has_tools',
    up: 'uptime'
};

export const sortHierarchy = {
    0: [{k: S.ctx, d: true}, {k: S.file, d: true}, {k: S.ctx, d: true}, {k: S.out, d: true}, {k: S.intel, d: true}, {k: S.agent, d: true}, {k: S.up, d: true}],
    1: [{k: S.intel, d: true}, {k: S.ctx, d: true}, {k: S.ctx, d: true}, {k: S.out, d: true}, {k: S.tool, d: true}, {k: S.up, d: true}],
    2: [{k: S.code, d: true}, {k: S.agent, d: true}, {k: S.tool, d: true}, {k: S.out, d: true}, {k: S.ctx, d: true}, {k: S.intel, d: true}, {k: S.ctx, d: true}],
    3: [{k: S.agent, d: true}, {k: S.tool, d: true}, {k: S.code, d: true}, {k: S.out, d: true}, {k: S.ctx, d: true}, {k: S.intel, d: true}, {k: S.ctx, d: true}, {k: S.up, d: true}],
    4: [{k: S.out, d: true}, {k: S.ctx, d: true}, {k: S.ctx, d: true}, {k: S.intel, d: true}, {k: S.code, d: true}, {k: S.agent, d: true}, {k: S.up, d: true}],
    5: [{k: S.refuse, d: false}, {k: S.code, d: true}, {k: S.agent, d: true}, {k: S.intel, d: true}, {k: S.ctx, d: true}, {k: S.ctx, d: true}, {k: S.out, d: true}, {k: S.up, d: true}]
};

export function val(obj, key, fallback = -999999) {
    let v = obj[key];
    return (v === undefined || v === null || isNaN(v)) ? fallback : v;
}

export function sortModelsForColumn(models, colIndex) {
    const hierarchy = sortHierarchy[colIndex];
    return [...models].sort((a, b) => {
        for (let i = 0; i < hierarchy.length; i++) {
            let { k, d } = hierarchy[i];
            const fallbackVal = colIndex === 5 ? 999999 : -999999;
            let va = val(a, k, fallbackVal);
            let vb = val(b, k, fallbackVal);
            if (va > vb) return d ? -1 : 1;
            if (va < vb) return d ? 1 : -1;
        }
        return 0;
    });
}

export async function fetchData(apiKey, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    
    // Phase 1: Benchmarks Snapshot
    const benchRes = await fetch('https://openrouter.ai/api/v1/benchmarks?source=artificial-analysis', { headers });
    if (!benchRes.ok) {
        const errText = await benchRes.text();
        throw new Error(`Benchmarks HTTP ${benchRes.status} ${benchRes.statusText}: ${errText.slice(0, 100)}`);
    }
    const bjson = await benchRes.json();
    storageAdapter.setItem('benchmarks_snapshot', JSON.stringify(bjson));

    const benchmarksMap = {};
    const dateRegex = /-(\d{8}|\d{4}-\d{2}-\d{2})$/;
    
    (bjson.data || []).forEach(b => {
        if (!b.model_permaslug) return;
        
        let baseName = b.model_permaslug;
        let dateVal = 0;
        
        const match = baseName.match(dateRegex);
        if (match) {
            baseName = baseName.slice(0, match.index);
            dateVal = parseInt(match[1].replace(/-/g, ''), 10);
        }
        
        const existing = benchmarksMap[baseName];
        if (!existing || existing.dateVal < dateVal) {
            benchmarksMap[baseName] = { ...b, dateVal };
        }
    });

    // Phase 2: Catalog Fetch
    const catRes = await fetch('https://openrouter.ai/api/v1/models', { headers });

    if (!catRes.ok) {
        const errText = await catRes.text();
        throw new Error(`Catalog HTTP ${catRes.status}: ${errText.slice(0, 50)}`);
    }
    const catData = await catRes.json();

    // Filter free models
    const freeModels = (catData.data || []).filter(m => m.pricing && m.pricing.prompt === "0");

    // Phase 3: Endpoints Fetch for Uptime and Latency
    const endpointsPromises = freeModels.map(async m => {
        try {
            const r = await fetch(`https://openrouter.ai/api/v1/models/${m.id}/endpoints`, { headers });
            if(r.ok) {
                const json = await r.json();
                return { id: m.id, endpoints: json.data?.endpoints || [] };
            }
        } catch(e) {}
        return { id: m.id, endpoints: [] };
    });
    const endpointsResults = await Promise.allSettled(endpointsPromises);
    const endpointsMap = {};
    endpointsResults.forEach(res => {
        if(res.status === 'fulfilled') {
            endpointsMap[res.value.id] = res.value.endpoints;
        }
    });

    // Load Refusals from storage
    let refusalRates = {};
    const cachedRates = storageAdapter.getItem('cached_refusalRates');
    if (cachedRates) {
        try { refusalRates = JSON.parse(cachedRates); } catch(e){}
    }

    // Parse variables
    const parsedModels = freeModels.map(model => {
        const inMods = model.architecture?.input_modalities || [];
        const archMod = model.architecture?.modality || "";
        const supportParams = model.supported_parameters || [];
        const instructType = model.architecture?.instruct_type || "";
        
        const hasFiles = inMods.includes('file') || inMods.includes('image') ? 1 : 0;
        const hasTools = (instructType === 'tool' || supportParams.includes('tools') || archMod.includes('tool')) ? 1 : 0;
        
        let maxTokens = null;
        if (model.top_provider && model.top_provider.max_completion_tokens) {
            maxTokens = model.top_provider.max_completion_tokens;
        }
        
        const baseSlug = model.id.split(':')[0];
        const stats = benchmarksMap[baseSlug] || {};
        
        const refusalRate = refusalRates[model.id] ?? null;

        // Endpoints (Uptime & Latency)
        const eps = endpointsMap[model.id] || [];
        let uptime = null;
        let latency = null;
        if (eps.length > 0) {
            uptime = eps[0].uptime_last_30m ?? null;
            latency = eps[0].latency_last_30m?.p50 ?? null;
        }

        return {
            id: model.id,
            name: model.name,
            context_length: model.context_length || (model.top_provider ? model.top_provider.context_length : null),
            max_completion_tokens: maxTokens,
            intelligence_index: stats.intelligence_index ?? null,
            coding_index: stats.coding_index ?? null,
            agentic_index: stats.agentic_index ?? null,
            refusal_rate: refusalRate,
            has_files: hasFiles,
            has_tools: hasTools,
            uptime: uptime,
            latency: latency,
            raw_modalities: inMods.join(', ') || archMod || "text"
        };
    });
    
    // Generate Ranked Columns
    const rankedColumns = [[], [], [], [], [], []];
    for(let c = 0; c < 6; c++) {
        rankedColumns[c] = sortModelsForColumn(parsedModels, c);
    }
    
    return { parsedModels, rankedColumns, refusalRates };
}

export async function refreshRefusalRates(apiKey, parsedModels, storageAdapter) {
    if (!apiKey) throw new Error("API Key is required.");
    if (!parsedModels || parsedModels.length === 0) throw new Error("Fetch models first.");

    const skeleton = {};
    parsedModels.forEach(m => { skeleton[m.id] = null; });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let res;
    try {
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openrouter/free",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are an AI safety expert. I am providing you with a JSON object where the keys are AI model IDs and the values are null. Estimate the refusal rate (0-100) for reverse engineering and modding tasks for each model based on your knowledge of their base architecture and typical safety alignment. Fill in the null values with your best estimate. Only leave the value as null if you have absolutely no information about the model or its base architecture. Return ONLY the completed JSON object. Ensure the returned JSON contains exactly the same keys as the skeleton." },
                    { role: "user", content: JSON.stringify(skeleton) }
                ]
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error("Estimation timed out. Please try again.");
        }
        throw e;
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LLM HTTP ${res.status}: ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    let parsedRates = {};
    try {
        parsedRates = JSON.parse(content);
    } catch(e) {
        throw new Error("LLM returned invalid JSON.");
    }

    storageAdapter.setItem('cached_refusalRates', JSON.stringify(parsedRates));

    // Update parsed models
    parsedModels.forEach(m => {
        m.refusal_rate = parsedRates[m.id] ?? null;
    });

    // Generate updated ranked columns
    const rankedColumns = [[], [], [], [], [], []];
    for(let c = 0; c < 6; c++) {
        rankedColumns[c] = sortModelsForColumn(parsedModels, c);
    }

    return { parsedModels, rankedColumns, refusalRates: parsedRates };
}
