---
name: Payvora voice pipeline honesty
description: What the F5-TTS backend genuinely supports and which UI controls must stay unavailable
---
The rule: every Voice Studio control must map to a real F5-TTS worker parameter or a verified app-side transform; anything else is disabled with an honest tooltip.

**Why:** The user was emphatic — no fake data, no fake success, no controls that "work" only visually. Earlier assumptions modeled on ElevenLabs were explicitly rejected.

**How to apply:**
- Worker `/v1/speech` accepts `controls` JSON: speed, pitch, energy, emotion only. `GET /api/voice/capabilities` is the source of truth (also reports `configured: false` when `F5_TTS_SERVICE_URL` unset — generation then fails honestly).
- Tags are handled app-side: `[pause]`-family → ffmpeg silence concat; `[slowly]/[fast]` → ffmpeg time-stretch; `[emphasis]` → energy; emotion tags → emotion. Unknown tags → 422 before generation, never spoken aloud.
- Permanently unavailable (no backend support): Stability, Similarity, Role presets, Clone-from-URL, share links, folders, "retrain".
- Never redesign existing pages; TextToSpeech.tsx IS the Voice Studio page — modify in place only.
- Generation records/audio scoped by signed session cookie ownerId; updateGenerationRecord takes optional ownerId for route-level writes.
