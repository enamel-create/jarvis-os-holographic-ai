# Plan: JARVIS Voice + Webcam + Particle Tuning

## 1. Webcam HUD Panel
Create `src/components/jarvis/WebcamPanel.tsx`:
- Request `navigator.mediaDevices.getUserMedia({ video: true })`.
- Render a small framed HUD panel (top-right area of `/workspace`) showing the live video feed.
- Themed border, corner brackets, scanline overlay, and "OPERATOR FEED" label using current theme tokens.
- Graceful fallback when camera is denied/unavailable (shows "CAMERA OFFLINE").
- Toggle button in top bar + keyboard shortcut `C`.

## 2. Voice Assistant (JARVIS replies)
Create `src/components/jarvis/VoiceAssistant.tsx` + `src/lib/jarvis-commands.ts`:
- Use the browser's `webkitSpeechRecognition` / `SpeechRecognition` for wake-word listening ("Jarvis ...").
- Use `speechSynthesis` for spoken replies (British male voice when available, to match JARVIS).
- Command parser handles:
  - `jarvis` / `hello jarvis` → "At your service, sir."
  - `switch to <theme> mode` (iron man, matrix, cyberpunk, tactical, quantum, jarvis) → switches theme + replies "Switching to Iron Man mode."
  - `show <template>` / `next template` / `previous template` → cycles particle templates.
  - `increase/decrease density`, `toggle hud`, `open/close diagnostics`, `status report` (reads FPS).
  - Unknown command → "I'm afraid I didn't catch that, sir."
- Floating mic indicator (bottom-right) with listening/speaking states + waveform pulse.
- Captions panel showing last heard phrase + JARVIS reply.
- Keyboard shortcut `V` to toggle voice mode.

## 3. Particle Density Lower Bound
In `src/components/jarvis/ParticleLab.tsx`: change the density slider `min` from current value (2000) to `1000`, update step if needed, and update default clamp in `src/routes/workspace.tsx` if it enforces ≥2000.

## Technical Notes
- All voice/webcam APIs are guarded with `typeof window !== 'undefined'` for SSR safety.
- Permissions requested only when user enables the feature (no auto-prompt on load).
- Web Speech API is browser-native — no external deps or API keys needed.
- New components wired into `src/routes/workspace.tsx` alongside existing HUD overlay.

## Files
- new: `src/components/jarvis/WebcamPanel.tsx`
- new: `src/components/jarvis/VoiceAssistant.tsx`
- new: `src/lib/jarvis-commands.ts`
- edit: `src/components/jarvis/ParticleLab.tsx` (min 1000)
- edit: `src/routes/workspace.tsx` (mount new panels, add C/V shortcuts, top-bar toggles)