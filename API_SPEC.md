# Enterprise API Specification (OpenAPI Subset)

## Base URL: `https://api.agrovision.io/v1`

| Method | Endpoint | Description | Auth | Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create user account | No | Any |
| `POST` | `/auth/login` | Login and get JWT | No | Any |
| `GET` | `/auth/me` | Get current user context | Yes | Any |
| `POST` | `/diagnose/upload` | Upload leaf image & get prediction | Yes | Farmer |
| `GET` | `/diagnose/history` | Get user diagnosis history | Yes | Farmer |
| `GET` | `/diagnose/:id` | Get specific diagnosis details (XAI) | Yes | Farmer, Agronomist |
| `POST` | `/diagnose/:id/verify` | Agronomist verification/overrule | Yes | Agronomist |
| `GET` | `/analytics/outbreaks` | Get regional disease trends | Yes | Admin, Agronomist |
| `GET` | `/analytics/model-perf` | Monitoring model drift & accuracy | Yes | Admin |

## Request Example: Diagnostic Processing
`POST /v1/diagnose/upload`
**Header:** `Authorization: Bearer <token>`
**Body (Multipart):**
- `file`: image binary
- `crop`: "Tomato"
- `lat`: 12.9716
- `lng`: 77.5946

## Response Example: Diagnostic Insight
```json
{
  "id": "diag_88122",
  "result": {
    "disease": "Late Blight",
    "confidence": 0.982,
    "severity": "High",
    "xai_heatmap_url": "https://cdn.agrovision.io/xai/diag_88122.png",
    "recommendations": {
      "organic": ["Remove infected leaves", "Neem oil spray"],
      "industrial": ["Chlorothalonil applied every 7 days"]
    }
  },
  "status": "processed",
  "meta": {
    "inference_ms": 240,
    "model_version": "agro-resnet-v2.1"
  }
}
```
