/* ==========================================================================
   KONFIGURASI EMBERLORD — Default (dioverride oleh backend via .env)
   ==========================================================================
   Nilai di sini adalah default. Saat backend berjalan, file
   http://localhost:8080/api/env-config.js akan dioverride otomatis
   dari variabel environment (.env).

   DIDUKUNG PROVIDER:
     - ollama   → pakai Ollama lokal (http://localhost:11434)
     - openai   → pakai OpenAI API
     - gemini   → pakai Google Gemini API
     - github   → pakai GitHub Models API
   ========================================================================== */

const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api',

    // ── Pilih provider: 'ollama' | 'openai' | 'gemini' | 'github' ──────────
    LLM_PROVIDER: 'ollama',

    // ── Ollama (default: http://localhost:11434) ────────────────────────────
    OLLAMA_API_URL: 'http://localhost:11434/v1/chat/completions',
    OLLAMA_MODEL: 'llama3.2',

    // ── OpenAI ──────────────────────────────────────────────────────────────
    OPENAI_API_KEY: '',
    OPENAI_MODEL: 'gpt-4o-mini',

    // ── Google Gemini ───────────────────────────────────────────────────────
    GEMINI_API_KEY: '',
    GEMINI_MODEL: 'gemini-2.0-flash',

    // ── GitHub Models ───────────────────────────────────────────────────────
    GITHUB_TOKEN: '',
    GITHUB_MODEL: 'gpt-4o-mini',
    GITHUB_API_URL: 'https://models.inference.ai.azure.com/chat/completions',
};
