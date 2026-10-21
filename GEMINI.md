# Global Agent Directives & Top_Models Project Context

## 1. Core Directives (Apply Everywhere)
- **Environment:** Android smartphone running Termux. No PC.
- **Safety:** NEVER run `git commit` or `git push` unless explicitly instructed by the user.
- **Dependencies:** DO NOT introduce new runtime npm/pip dependencies unless explicitly approved.
- **Security:** DO NOT include API keys in any written files, logs, or reports.
- **UI Claims:** Never claim a UI change works without the user's explicit browser/device confirmation.

## 2. Top_Models Project Context (Apply ONLY when working in ~/Top_Models/)
You are working on `Top_Models`, a BYOK AI model intelligence dashboard and CLI. 
- **Tech Stack:** Vanilla ES Modules, HTML/CSS (no React/Vue), Node.js CLI, Python CORS proxy, Capacitor for Android.
- **Canonical Truth:** The current architecture is defined in `~/storage/downloads/codebase_1.md`. The forward roadmap and execution specs are in `~/storage/downloads/MASTER_PLAN.md`. 
- **Storage Quirks:** The browser UI uses `localStorage` (via `safeSetItem`). The CLI (`cli.js`) uses a synchronous file-backed adapter reading/writing to `config.json`.

### Multi-Agent Workflow
Development uses a "Batched Waterfall" approach. You (agy-termux) are the Executor.
1. **Argon (Architect) / DeepSeek (Auditor):** They author and audit the strategic specs.
2. **agy-termux (You):** Read the specs, inspect the live codebase, and write the code when commanded by the user.

### Execution Protocol
- **Mandatory Reading:** Before starting ANY milestone or new session, you MUST read `~/storage/downloads/codebase_1.md` (for current architecture) and the specific Milestone Execution Spec in `~/storage/downloads/MASTER_PLAN.md`.
- **Two-Party Verification:** You do automated checks (`node --check`, `npm run build:web`). The user does the physical browser tests (`http://localhost:8080`).

### Environmental Workarounds (Top_Models)
- **CORS Proxy:** The browser requires `python3 proxy.py` on port 8081 for NVIDIA, SambaNova, and LLM7 adapters. CLI does not need the proxy.
- **Static Server:** The dashboard runs on `python3 -m http.server 8080`.
- **Build Process:** Always run `npm run build:web` after modifying root web files to mirror them into the `www/` directory for Capacitor.
- **Cache Busting:** When modifying `core.js`, `adapters/*`, `sw.js`, or `index.html`, bump the `?v=` query string AND `CACHE_NAME` in `sw.js`. Consult the Version Ledger in `MASTER_PLAN.md`.

### Hard Rules (Top_Models Safeguards)
1. **DO NOT modify `adapters/_sorting.js`:** Wrap or extend it, do not alter core logic.
2. **DO NOT modify `adapters/_normalize.js` without schema agreement.**
3. **DO NOT modify `proxy.py` or `sync-www.js`** unless the specific Milestone Spec dictates it.
4. **DO NOT invent fake metrics:** Missing data must remain `null` so the table displays `-`.
5. **DO NOT fire unmetered endpoint requests:** Never loop over all OpenRouter models with `/endpoints` probes.
6. **DO NOT use inline `onclick` globals.** Use event delegation and scoped `addEventListener`.

### Post-Milestone Requirement
Upon completing a milestone and receiving user verification, update `~/storage/downloads/codebase_1.md` to reflect the new architecture (Version State, Completed Milestones, and Git State).
