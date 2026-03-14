# PredictIQ Video Demo Pipeline

## Prerequisites
- Node.js 18+, Playwright: `npx playwright install chromium`
- Python 3.8+: `pip install edge-tts mutagen`
- ffmpeg: `choco install ffmpeg` (Windows) or `brew install ffmpeg` (Mac)

## Run Order

1. Start app: `npm run dev`
2. Generate audio: `python scripts/video/generate-audio.py`
3. Validate: `python scripts/video/validate-sync.py`
4. Record video: `npx tsx scripts/video/record-demo.ts`
5. Validate sync: `python scripts/video/validate-sync.py`
6. Merge: `bash scripts/video/merge.sh` (use Git Bash on Windows)
7. Output: `scripts/video/predictiq-demo-final.mp4`

## Demo Flow (27 scenes, ~5 min)
- Scenes 01-02: Landing page
- Scenes 03-09: ADMIN (dashboard, AI summary, users, audit, AI chat)
- Scenes 10-20: MANAGER (equipment, sensors, alerts, predictions, root cause, work orders, analytics)
- Scenes 21-26: TECHNICIAN (focused dashboard, RBAC, work orders, alerts)
- Scene 27: Closing

## AI Hero Moments (7 total)
1. AI Summary on dashboard (scene 05)
2. AI Chat — ask about urgent equipment (scene 08)
3. AI Chat response with real data (scene 09)
4. AI Anomaly Explainer on sensor charts (scene 14)
5. AI Predictions — failure forecasting (scene 16)
6. AI Root Cause Analysis (scene 17)
7. AI Maintenance Advisor (scene 20)
