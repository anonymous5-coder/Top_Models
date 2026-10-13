// adapters/_sorting.js
// Extracted Ranked Matrix Sorting Engine and Hierarchy Constants

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
