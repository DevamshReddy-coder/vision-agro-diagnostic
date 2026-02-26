# Vision Driven Agro Diagnostic Framework (Enterprise v2)

A production-ready, scalable AI platform for real-time crop disease detection and agricultural intelligence.

## 🚀 Architecture
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Recharts.
- **Backend API**: Node.js, Express, MongoDB (Aggregation, RBAC, JWT).
- **ML Service**: Python FastAPI, PyTorch (Custom ResNet CNN), Torchvision.
- **Infrastructure**: Docker, Docker Compose.

## 🛠️ Components
1. **Diagnosis Workspace**: Real-time image processing with severity scoring & treatment protocols.
2. **Analytics Hub**: Deep reporting on infection trends, accuracy metrics, and regional outbreaks.
3. **Security**: Role-Based Access Control (Farmer, Agronomist, Admin) and Rate Limiting.
4. **Knowledge Engine**: Aggregated prevention and treatment database.

## 🏁 Quick Start (Local)

### Using Docker (Recommended)
```bash
docker-compose up --build
```

### Manual Setup

#### 1. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

#### 2. Backend
```bash
cd server
npm install
npm run start
```

#### 3. Frontend
```bash
cd client
npm install
npm run dev
```

## 🌍 Service Map
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000 (Protected via JWT)
- **ML Engine**: http://localhost:8000/predict

---
Developed as a production-grade Agri-Tech solution for global scalability.
