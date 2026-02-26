# Product Experience & User Journey Design

## 1. User Onboarding
- **Multi-lingual Support**: Language selection upon first open (optimized for regional dialects).
- **Profile Setup**: Farmer vs. Agronomist vs. Researcher roles.
- **Guided Tutorial**: A brief, interactive tour of how to capture the best leaf image for the AI.

## 2. The "Snap & Diagnose" Flow (The Heart of the App)
1. **Camera Interface**: Built-in visual guides (overlays) to ensure correct focal length and lighting.
2. **Instant Upload**: Low-res preview is uploaded first for lightning-fast feedback, followed by high-res for full analysis.
3. **Real-time Processing**: A sleek, animated "Neural Scan" effect while the ML engine runs.
4. **Insight Screen**:
   - **Explainability**: "The AI detected rust patterns here" (highlighted on image).
   - **Confidence Score**: Transparently communicating how sure the system is.
   - **Treatment Card**: Immediate steps (e.g., "Isolate these plants") and long-term cures.

## 3. Dashboards
- **Farmer**: Map view of their farm with "Hotspots" of detected diseases. History of all scans.
- **Agronomist**: Batch review of pending scans. Ability to "Approve" AI findings or "Override" with expert knowledge.
- **Admin**: System-wide analytics. Outbreak heatmaps. Accuracy monitoring.

## 4. Resilience for Rural Environments
- **Offline Queuing**: Scans can be taken offline and auto-sync when back in range.
- **Low-Bandwidth Mode**: Core data is sent via JSON; images are compressed on-device before transmission.
- **PWA Excellence**: Installable on any Android/iOS device without needing a high-speed app store download.

## 5. Visual Identity
- **Palette**: `Emerald-600` (Growth), `Slate-900` (Professionalism), `Amber-500` (Alerts).
- **Typography**: `Inter` for clarity, `Outfit` for a modern tech feel.
- **Micro-interactions**: Subtle haptic feedback and smooth transitions using Framer Motion.
