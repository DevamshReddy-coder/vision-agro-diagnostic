# Product Roadmap & Feature Strategy

## Phase 1: Foundation (V1.0 - Core SaaS)
- [ ] **Unified Identity**: JWT-based auth with Role-Based Access Control (RBAC).
- [ ] **Diagnostic MVP**: High-accuracy (ResNet-50) model serving for 38+ plant diseases.
- [ ] **Basic Dashboard**: History tracking, profile management, and image upload.
- [ ] **Mobile Responsive UI**: Focused on low-latency interactions.

## Phase 2: Intelligence & Engagement (V2.0 - Advanced AI)
- [ ] **Explainable AI (XAI)**: Grad-CAM heatmaps showing which part of the leaf the AI focused on.
- [ ] **Offline Mode**: PWA support with local model inference (TFLite/ONNX).
- [ ] **Agronomist Portal**: Expert verification workflow for AI predictions.
- [ ] **Treatment Recommendations**: Integrated database of approved pesticides and biological controls.

## Phase 3: Enterprise & Scale (V3.0 - Precision Agriculture)
- [ ] **Outbreak Prediction**: Geospatial analytics to predict disease spread.
- [ ] **API for Partners**: Third-party integration for drone operators and chemical suppliers.
- [ ] **Automated Retraining**: Feedback loop (Human-in-the-loop) for continuous model improvement.
- [ ] **Satellite Integration**: Correlating leaf analysis with NDVI satellite data.

---

## Folder Structure (Target Production Grade)

### `/client` (Next.js 15)
- `/app` - App router (routes, layouts, error boundaries)
- `/components` - Atomic design (UI, Layout, Modules)
- `/hooks` - Custom React hooks (useAuth, useDiagnostic)
- `/services` - API abstraction layer (axios instances, interceptors)
- `/store` - State management (Zustand)
- `/types` - TypeScript interfaces/enums
- `/lib` - Utilities and library configs (shadcn/ui, framer-motion)

### `/server` (Node.js/Express)
- `/src/controllers` - Request handling/validation
- `/src/services` - Business logic layer
- `/src/repositories` - Data access layer (Mongoose models)
- `/src/middleware` - Auth, RBAC, Error handling, Rate limiting
- `/src/validations` - Zod/Joi schemas
- `/src/jobs` - BullMQ workers for async tasks
- `/src/config` - Environment & configuration

### `/ml-service` (FastAPI)
- `/app/api` - Endpoint definitions
- `/app/core` - Logic, image processing
- `/app/models` - Model loader and inference logic
- `/app/schemas` - Request/Response Pydantic models
- `/scripts` - Training and versioning scripts
