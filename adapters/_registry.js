// adapters/_registry.js
// Provider Registry Scaffold & Metadata Mapping

export const PROVIDER_REGISTRY = {
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        group: 'A',
        defaultEndpoint: 'https://openrouter.ai/api/v1/models',
        keyUrl: 'https://openrouter.ai/workspaces/default/keys',
        keyPlaceholder: 'Paste OpenRouter API Key Here...',
        requiresKey: true
    },
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        group: 'A',
        defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        keyUrl: 'https://aistudio.google.com/app/apikey',
        keyPlaceholder: 'Paste Gemini API Key Here...',
        requiresKey: true
    },
    groq: {
        id: 'groq',
        name: 'Groq',
        group: 'A',
        defaultEndpoint: 'https://api.groq.com/openai/v1/models',
        keyUrl: 'https://console.groq.com/keys',
        keyPlaceholder: 'Paste Groq API Key Here...',
        requiresKey: true
    },
    cerebras: {
        id: 'cerebras',
        name: 'Cerebras',
        group: 'A',
        defaultEndpoint: 'https://api.cerebras.ai/v1/models',
        keyUrl: 'https://cloud.cerebras.ai/',
        keyPlaceholder: 'Paste Cerebras API Key Here...',
        requiresKey: true
    },
    mistral: {
        id: 'mistral',
        name: 'Mistral',
        group: 'A',
        defaultEndpoint: 'https://api.mistral.ai/v1/models',
        keyUrl: 'https://console.mistral.ai/api-keys/',
        keyPlaceholder: 'Paste Mistral API Key Here...',
        requiresKey: true
    },
    nvidia: {
        id: 'nvidia',
        name: 'NVIDIA NIM',
        group: 'A',
        defaultEndpoint: 'https://integrate.api.nvidia.com/v1/models',
        keyUrl: 'https://build.nvidia.com/',
        keyPlaceholder: 'Paste NVIDIA NIM API Key Here...',
        requiresKey: true
    },
    cohere: {
        id: 'cohere',
        name: 'Cohere',
        group: 'A',
        defaultEndpoint: 'https://api.cohere.com/v2/models',
        keyUrl: 'https://dashboard.cohere.com/api-keys',
        keyPlaceholder: 'Paste Cohere API Key Here...',
        requiresKey: true
    },
    modelscope: {
        id: 'modelscope',
        name: 'ModelScope',
        group: 'A',
        defaultEndpoint: 'https://api-inference.modelscope.cn/v1/models',
        keyUrl: 'https://modelscope.cn/',
        keyPlaceholder: 'Paste ModelScope API Key Here...',
        requiresKey: true
    },
    sambanova: {
        id: 'sambanova',
        name: 'SambaNova',
        group: 'A',
        defaultEndpoint: 'https://api.sambanova.ai/v1/models',
        keyUrl: 'https://cloud.sambanova.ai/apis',
        keyPlaceholder: 'Paste SambaNova API Key Here...',
        requiresKey: true
    },
    llm7: {
        id: 'llm7',
        name: 'LLM7.io',
        group: 'A',
        defaultEndpoint: 'https://api.llm7.io/v1/models',
        keyUrl: 'https://llm7.io/',
        keyPlaceholder: 'Paste LLM7 API Key Here...',
        requiresKey: true
    },
    bytez: {
        id: 'bytez',
        name: 'Bytez',
        group: 'A',
        defaultEndpoint: 'https://api.bytez.com/models/v2/list/models',
        keyUrl: 'https://bytez.com/',
        keyPlaceholder: 'Paste Bytez API Key Here...',
        requiresKey: true
    },
    cloudflare: {
        id: 'cloudflare',
        name: 'Cloudflare Workers AI',
        group: 'B',
        defaultEndpoint: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/models/search',
        keyUrl: 'https://dash.cloudflare.com/',
        keyPlaceholder: 'Paste Cloudflare API Token Here...',
        requiresKey: true
    },
    ollama: {
        id: 'ollama',
        name: 'Ollama Cloud',
        group: 'B',
        defaultEndpoint: 'https://ollama.com/api/tags',
        keyUrl: 'https://ollama.com/',
        keyPlaceholder: 'Paste Ollama API Key Here (Optional)...',
        requiresKey: false
    },
    ovh: {
        id: 'ovh',
        name: 'OVHcloud AI Endpoints',
        group: 'B',
        defaultEndpoint: 'https://endpoints.ai.cloud.ovh.net/v1/models',
        keyUrl: 'https://endpoints.ai.cloud.ovh.net/',
        keyPlaceholder: 'Anonymous or Paste Token...',
        requiresKey: false
    },
    watsonx: {
        id: 'watsonx',
        name: 'IBM watsonx.ai',
        group: 'B',
        defaultEndpoint: 'https://us-south.ml.cloud.ibm.com/ml/v1/foundation_model_specs',
        keyUrl: 'https://cloud.ibm.com/',
        keyPlaceholder: 'Paste IBM Cloud API Key Here...',
        requiresKey: true
    }
};

const adapterModules = new Map();

export function registerAdapter(providerId, adapterModule) {
    adapterModules.set(providerId, adapterModule);
}

export function getAdapter(providerId) {
    return adapterModules.get(providerId) || null;
}
