# Enterprise Database Schema Architecture

## 1. User Entity
```typescript
interface User {
  _id: ObjectId;
  email: string; // Unique
  passwordHash: string;
  role: 'Farmer' | 'Agronomist' | 'Admin';
  profile: {
    fullName: string;
    phoneNumber: string;
    location: string;
    avatarUrl?: string;
  };
  organizationId?: ObjectId; // For enterprise accounts
  settings: {
    notifications: boolean;
    language: 'EN' | 'ES' | 'HI' | 'FR';
  };
  isActive: boolean;
  lastLogin: Date;
}
```

## 2. Diagnosis Entity (History & AI Results)
```typescript
interface Diagnosis {
  _id: ObjectId;
  userId: ObjectId;
  cropId: string; // From taxonomy
  imageUrl: string; 
  xaiHeatmapUrl?: string;
  aiResult: {
    label: string;
    confidence: number;
    modelVersion: string;
    inferenceTimeMs: number;
  };
  expertVerification?: {
    agronomistId: ObjectId;
    verifiedLabel: string;
    comments: string;
    updatedAt: Date;
  };
  location: {
    type: "Point";
    coordinates: [longitude, latitude]; // GeoJSON for geospatial queries
  };
  severity: 1 | 2 | 3 | 4; // 1=Low, 4=Critical
  status: 'pending' | 'completed' | 'verified' | 'archived';
}
```

## 3. Crop/Disease Taxonomy (Dynamic KB)
```typescript
interface DiseaseTaxonomy {
  _id: ObjectId;
  commonName: string;
  scientificName: string;
  symptoms: string[];
  treatmentProtocol: {
    biological: string[];
    chemical: string[];
    prevention: string[];
  };
}
```

## 4. System Metrics
```typescript
interface AuditLog {
  _id: ObjectId;
  action: string;
  performedBy: ObjectId;
  targetId?: ObjectId;
  metadata: any;
  timestamp: Date;
}
```
