// adapters/_filter.js
// Pure filtering engine and declarative filter definitions

export const DEFAULT_FILTER_STATE = {
    free: 'free_eligible', // 'all' | 'free_eligible' | 'strict_free' | 'paid_only'
    is_chat: 'chat_only'   // 'all' | 'chat_only' | 'non_chat'
};

export const FILTER_DEFINITIONS = [
    {
        id: 'free',
        label: 'Pricing Tier',
        type: 'radio',
        options: [
            { value: 'free_eligible', label: 'Free & Unspecified (Default)', predicate: m => m.free !== false },
            { value: 'strict_free',   label: 'Verified Free Only ($0)',        predicate: m => m.free === true },
            { value: 'paid_only',     label: 'Paid / Commercial Only',         predicate: m => m.free === false },
            { value: 'all',           label: 'All Price Tiers',                predicate: () => true }
        ]
    },
    {
        id: 'is_chat',
        label: 'Model Task Type',
        type: 'radio',
        options: [
            { value: 'chat_only', label: 'Chat & Instruct (Default)', predicate: m => m.is_chat === true },
            { value: 'non_chat',  label: 'Non-Chat (Embed/Audio)',    predicate: m => m.is_chat === false },
            { value: 'all',       label: 'All Task Types',            predicate: () => true }
        ]
    }
];

export function applyModelFilters(models, filterState = DEFAULT_FILTER_STATE) {
    if (!Array.isArray(models)) return [];

    const state = filterState || DEFAULT_FILTER_STATE;

    const freeDef = FILTER_DEFINITIONS.find(d => d.id === 'free');
    const freeOpt = freeDef?.options.find(o => o.value === state.free) || freeDef?.options[0];

    const chatDef = FILTER_DEFINITIONS.find(d => d.id === 'is_chat');
    const chatOpt = chatDef?.options.find(o => o.value === state.is_chat) || chatDef?.options[0];

    return models.filter(m => {
        if (!m) return false;
        if (freeOpt && !freeOpt.predicate(m)) return false;
        if (chatOpt && !chatOpt.predicate(m)) return false;
        return true;
    });
}
