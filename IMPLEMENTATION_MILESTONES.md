# 🎯 3DXTalentMatrix: Implementation Milestones & Coding Guide

## 📋 Milestone Overview

### Phase 1: Foundation & Architecture (Months 1-3)

#### Milestone 1.1: Development Environment Setup (Week 1-2)
```bash
# Project Structure Setup
mkdir 3dx-talent-matrix-v2
cd 3dx-talent-matrix-v2

# Initialize monorepo with Nx
npx create-nx-workspace@latest 3dx-talent-matrix \
  --preset=react-monorepo \
  --packageManager=npm \
  --style=css

# Add backend workspace
nx g @nrwl/node:app api
nx g @nrwl/node:app auth-service
nx g @nrwl/node:app skills-service
nx g @nrwl/node:app assessment-service
nx g @nrwl/node:app analytics-service

# Add shared libraries
nx g @nrwl/js:lib shared-types
nx g @nrwl/js:lib shared-utils
nx g @nrwl/js:lib shared-config
```

**Deliverables:**
- ✅ Monorepo structure with Nx
- ✅ Development environment configuration
- ✅ CI/CD pipeline setup (GitHub Actions)
- ✅ Code quality tools (ESLint, Prettier, Husky)
- ✅ Docker development environment

#### Milestone 1.2: Database Design & Setup (Week 3-4)
```sql
-- Database Migration Scripts
-- File: migrations/001_initial_schema.sql

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table with enhanced fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(255),
    manager_id UUID REFERENCES users(id),
    avatar_url TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Deliverables:**
- ✅ PostgreSQL database schema
- ✅ Migration scripts and versioning
- ✅ Database connection pooling
- ✅ Redis cache configuration
- ✅ Elasticsearch setup for search

#### Milestone 1.3: Authentication Service (Week 5-6)
```typescript
// File: apps/auth-service/src/main.ts
import express from 'express';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JWTService } from './services/jwt.service';
import { UserRepository } from './repositories/user.repository';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
const userRepo = new UserRepository();
const jwtService = new JWTService();
const authService = new AuthService(userRepo, jwtService);
const authController = new AuthController(authService);

app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.post('/auth/refresh', authController.refresh);
app.get('/auth/profile', authController.getProfile);

// File: apps/auth-service/src/services/auth.service.ts
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private jwtService: JWTService
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Validate credentials
    const user = await this.userRepo.findByEmail(credentials.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = await this.jwtService.generateAccessToken(user);
    const refreshToken = await this.jwtService.generateRefreshToken(user);

    // Update last login
    await this.userRepo.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const attempts = user.failedLoginAttempts + 1;
    const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    
    await this.userRepo.updateFailedAttempts(user.id, attempts, lockUntil);
  }
}
```

**Deliverables:**
- ✅ JWT-based authentication system
- ✅ Password hashing and validation
- ✅ Account lockout protection
- ✅ Session management
- ✅ API documentation (OpenAPI/Swagger)

### Phase 2: Core Platform Enhancement (Months 4-6)

#### Milestone 2.1: Real-time Infrastructure (Week 7-8)
```typescript
// File: apps/api/src/websocket/websocket.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { userId: string; organizationId: string }) {
    const room = `org:${payload.organizationId}`;
    client.join(room);
    
    // Notify others in the room
    client.to(room).emit('user-joined', {
      userId: payload.userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('assessment-update')
  handleAssessmentUpdate(client: Socket, payload: AssessmentUpdateEvent) {
    const room = `org:${payload.organizationId}`;
    
    // Broadcast to all users in organization
    this.server.to(room).emit('assessment-updated', {
      assessmentId: payload.assessmentId,
      status: payload.status,
      updatedBy: payload.userId,
      timestamp: new Date(),
    });
  }

  // Real-time notifications
  async sendNotification(userId: string, notification: Notification) {
    const userSockets = await this.getUserSockets(userId);
    userSockets.forEach(socket => {
      socket.emit('notification', notification);
    });
  }
}

// File: apps/api/src/events/event.service.ts
export class EventService {
  constructor(
    private readonly websocketGateway: WebSocketGateway,
    private readonly messageQueue: MessageQueueService
  ) {}

  async publishEvent(event: DomainEvent): Promise<void> {
    // Publish to message queue for async processing
    await this.messageQueue.publish(event.type, event);

    // Send real-time updates via WebSocket
    await this.handleRealTimeUpdate(event);
  }

  private async handleRealTimeUpdate(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case 'assessment.submitted':
        await this.notifyManagerOfNewAssessment(event);
        break;
      case 'assessment.reviewed':
        await this.notifyEmployeeOfReview(event);
        break;
      case 'skill.updated':
        await this.broadcastSkillUpdate(event);
        break;
    }
  }
}
```

**Deliverables:**
- ✅ WebSocket infrastructure for real-time updates
- ✅ Event-driven architecture with message queues
- ✅ Real-time notifications system
- ✅ Live dashboard updates
- ✅ Collaborative assessment features

#### Milestone 2.2: Progressive Web App (Week 9-10)
```typescript
// File: apps/web/src/sw.ts - Service Worker
const CACHE_NAME = '3dx-talent-matrix-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// File: apps/web/public/manifest.json
{
  "name": "3DXTalentMatrix - Skills Intelligence Platform",
  "short_name": "3DXTalentMatrix",
  "description": "Empowering Talent. Mapping Skills. Driving Excellence.",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// File: apps/web/src/hooks/useOfflineSync.ts
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    for (const action of pendingActions) {
      try {
        await executeAction(action);
        removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  };

  const addPendingAction = (action: PendingAction) => {
    setPendingActions(prev => [...prev, action]);
    localStorage.setItem('pendingActions', JSON.stringify([...pendingActions, action]));
  };

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    syncPendingActions,
  };
};
```

**Deliverables:**
- ✅ Progressive Web App with offline capabilities
- ✅ Service Worker for caching and background sync
- ✅ Push notifications infrastructure
- ✅ Mobile-optimized responsive design
- ✅ App store deployment (PWA)

### Phase 3: Intelligence & Analytics (Months 7-9)

#### Milestone 3.1: AI/ML Infrastructure (Week 11-12)
```python
# File: apps/ml-service/src/models/skill_recommender.py
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import joblib

class SkillRecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.similarity_matrix = None
        self.skill_clusters = None
        
    def train(self, skills_data: pd.DataFrame, user_assessments: pd.DataFrame):
        """Train the recommendation model"""
        # Create skill feature vectors
        skill_descriptions = skills_data['description'].fillna('')
        skill_vectors = self.vectorizer.fit_transform(skill_descriptions)
        
        # Calculate similarity matrix
        self.similarity_matrix = cosine_similarity(skill_vectors)
        
        # Cluster skills for better recommendations
        kmeans = KMeans(n_clusters=10, random_state=42)
        self.skill_clusters = kmeans.fit_predict(skill_vectors)
        
        # Save model
        self.save_model()
        
    def recommend_skills(self, user_id: str, current_skills: list, target_role: str = None) -> list:
        """Recommend skills for a user based on their current skills and career goals"""
        recommendations = []
        
        # Content-based filtering
        content_recs = self._content_based_recommendations(current_skills)
        
        # Collaborative filtering
        collab_recs = self._collaborative_filtering(user_id)
        
        # Career path recommendations
        if target_role:
            career_recs = self._career_path_recommendations(current_skills, target_role)
            recommendations.extend(career_recs)
        
        # Combine and rank recommendations
        all_recs = content_recs + collab_recs
        ranked_recs = self._rank_recommendations(all_recs, current_skills)
        
        return ranked_recs[:10]  # Top 10 recommendations
    
    def _content_based_recommendations(self, current_skills: list) -> list:
        """Find similar skills based on content similarity"""
        recommendations = []
        
        for skill in current_skills:
            skill_idx = self._get_skill_index(skill)
            if skill_idx is not None:
                # Get similar skills
                similarities = self.similarity_matrix[skill_idx]
                similar_indices = np.argsort(similarities)[::-1][1:6]  # Top 5 similar
                
                for idx in similar_indices:
                    recommendations.append({
                        'skill_id': self._get_skill_id(idx),
                        'similarity_score': similarities[idx],
                        'reason': f'Similar to {skill}'
                    })
        
        return recommendations

# File: apps/ml-service/src/api/recommendations.py
from flask import Flask, request, jsonify
from models.skill_recommender import SkillRecommendationEngine
from models.career_path_predictor import CareerPathPredictor

app = Flask(__name__)

# Initialize ML models
skill_recommender = SkillRecommendationEngine()
career_predictor = CareerPathPredictor()

@app.route('/recommendations/skills', methods=['POST'])
def get_skill_recommendations():
    data = request.json
    user_id = data.get('user_id')
    current_skills = data.get('current_skills', [])
    target_role = data.get('target_role')
    
    try:
        recommendations = skill_recommender.recommend_skills(
            user_id, current_skills, target_role
        )
        
        return jsonify({
            'recommendations': recommendations,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/predictions/career-path', methods=['POST'])
def predict_career_path():
    data = request.json
    current_skills = data.get('current_skills', [])
    experience_years = data.get('experience_years', 0)
    
    try:
        predictions = career_predictor.predict_career_paths(
            current_skills, experience_years
        )
        
        return jsonify({
            'career_paths': predictions,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Deliverables:**
- ✅ ML service infrastructure (Python/Flask)
- ✅ Skill recommendation engine
- ✅ Career path prediction model
- ✅ Competency mapping algorithms
- ✅ Model training and deployment pipeline

#### Milestone 3.2: Advanced Analytics Dashboard (Week 13-14)
```typescript
// File: apps/web/src/components/AdvancedAnalytics/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, BarChart, RadarChart, Treemap } from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { SkillGapHeatmap } from './SkillGapHeatmap';
import { TrendAnalysis } from './TrendAnalysis';
import { PredictiveInsights } from './PredictiveInsights';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const {
    skillGapData,
    trendData,
    predictiveInsights,
    organizationBenchmarks,
    loading,
    refreshData
  } = useAnalytics();

  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  return (
    <div className="analytics-dashboard">
      {/* Control Panel */}
      <div className="controls-panel">
        <TimeRangeSelector 
          value={selectedTimeRange}
          onChange={setSelectedTimeRange}
        />
        <DepartmentFilter
          value={selectedDepartment}
          onChange={setSelectedDepartment}
        />
        <button onClick={refreshData} disabled={loading}>
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Skill Coverage"
          value={`${skillGapData.coverage}%`}
          trend={skillGapData.coverageTrend}
          icon="target"
        />
        <MetricCard
          title="Average Skill Level"
          value={skillGapData.averageLevel.toFixed(1)}
          trend={skillGapData.levelTrend}
          icon="trending-up"
        />
        <MetricCard
          title="Critical Gaps"
          value={skillGapData.criticalGaps}
          trend={skillGapData.gapsTrend}
          icon="alert-triangle"
        />
        <MetricCard
          title="Learning Velocity"
          value={`${trendData.learningVelocity}%`}
          trend={trendData.velocityTrend}
          icon="zap"
        />
      </div>

      {/* Visualization Grid */}
      <div className="visualization-grid">
        {/* Skill Gap Heatmap */}
        <div className="chart-container">
          <h3>Skill Gap Heatmap</h3>
          <SkillGapHeatmap data={skillGapData.heatmapData} />
        </div>

        {/* Trend Analysis */}
        <div className="chart-container">
          <h3>Skill Development Trends</h3>
          <TrendAnalysis data={trendData.skillTrends} />
        </div>

        {/* Predictive Insights */}
        <div className="chart-container">
          <h3>Predictive Insights</h3>
          <PredictiveInsights insights={predictiveInsights} />
        </div>

        {/* Organization Benchmarks */}
        <div className="chart-container">
          <h3>Industry Benchmarks</h3>
          <BenchmarkComparison data={organizationBenchmarks} />
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="reports-section">
        <ReportGenerator
          onGenerateReport={handleGenerateReport}
          availableReports={[
            'skill-gap-analysis',
            'talent-pipeline',
            'learning-effectiveness',
            'roi-analysis'
          ]}
        />
      </div>
    </div>
  );
};

// File: apps/web/src/hooks/useAnalytics.ts
export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (filters: AnalyticsFilters) => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getAdvancedAnalytics(filters);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, options: ReportOptions) => {
    try {
      const response = await analyticsAPI.generateReport(reportType, options);
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  };

  return {
    ...analyticsData,
    loading,
    fetchAnalytics,
    generateReport,
    refreshData: () => fetchAnalytics({}),
  };
};
```

**Deliverables:**
- ✅ Advanced analytics dashboard with interactive visualizations
- ✅ Real-time data processing pipeline
- ✅ Predictive analytics integration
- ✅ Custom report generation
- ✅ Industry benchmarking capabilities

## 🎯 Success Criteria & Testing

### Code Quality Standards
```typescript
// File: .eslintrc.js
module.exports = {
  extends: [
    '@nrwl/eslint-plugin-nx/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off',
    'complexity': ['error', 10],
    'max-lines-per-function': ['error', 50],
  },
};

// File: jest.config.js
module.exports = {
  projects: [
    '<rootDir>/apps/web',
    '<rootDir>/apps/api',
    '<rootDir>/libs/shared-types',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Performance Benchmarks
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms (95th percentile)
- **Database Query Time**: < 100ms (average)
- **WebSocket Latency**: < 50ms
- **Bundle Size**: < 1MB (gzipped)

### Security Requirements
- **OWASP Top 10**: Full compliance
- **Data Encryption**: AES-256 for sensitive data
- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control
- **Audit Logging**: Complete activity tracking

## 🔄 Development Workflow & Best Practices

### Git Workflow Strategy
```bash
# Feature Branch Workflow
git checkout -b feature/skill-recommendations
git add .
git commit -m "feat(ml): implement skill recommendation engine

- Add content-based filtering algorithm
- Implement collaborative filtering
- Add career path recommendations
- Include similarity scoring

Closes #123"

# Pull Request Template
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Code Review Standards
```typescript
// Example: Good Code Structure
// File: apps/api/src/services/assessment.service.ts

/**
 * Assessment Service
 * Handles all assessment-related business logic
 */
export class AssessmentService {
  constructor(
    private readonly assessmentRepo: AssessmentRepository,
    private readonly userRepo: UserRepository,
    private readonly eventService: EventService,
    private readonly logger: Logger
  ) {}

  /**
   * Submit self-assessment for review
   * @param assessmentData - Assessment data to submit
   * @param userId - ID of the user submitting
   * @returns Promise<Assessment>
   */
  async submitAssessment(
    assessmentData: CreateAssessmentDto,
    userId: string
  ): Promise<Assessment> {
    this.logger.info('Submitting assessment', { userId, skillId: assessmentData.skillId });

    // Validate input
    await this.validateAssessmentData(assessmentData);

    // Check user permissions
    await this.validateUserPermissions(userId, assessmentData);

    // Create assessment
    const assessment = await this.assessmentRepo.create({
      ...assessmentData,
      employeeId: userId,
      status: AssessmentStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    // Publish event for real-time updates
    await this.eventService.publishEvent({
      type: 'assessment.submitted',
      aggregateId: assessment.id,
      aggregateType: 'assessment',
      data: assessment,
      metadata: {
        userId,
        organizationId: assessment.organizationId,
        timestamp: new Date(),
        version: 1,
      },
    });

    this.logger.info('Assessment submitted successfully', {
      assessmentId: assessment.id,
      userId
    });

    return assessment;
  }

  private async validateAssessmentData(data: CreateAssessmentDto): Promise<void> {
    if (!data.skillId || !data.selfAssessedLevel) {
      throw new ValidationError('Missing required assessment data');
    }

    if (data.selfAssessedLevel < 0 || data.selfAssessedLevel > 4) {
      throw new ValidationError('Invalid skill level range');
    }
  }
}
```

### Testing Strategy
```typescript
// File: apps/api/src/services/__tests__/assessment.service.spec.ts
describe('AssessmentService', () => {
  let service: AssessmentService;
  let mockAssessmentRepo: jest.Mocked<AssessmentRepository>;
  let mockEventService: jest.Mocked<EventService>;

  beforeEach(() => {
    mockAssessmentRepo = createMockAssessmentRepository();
    mockEventService = createMockEventService();

    service = new AssessmentService(
      mockAssessmentRepo,
      mockUserRepo,
      mockEventService,
      mockLogger
    );
  });

  describe('submitAssessment', () => {
    it('should successfully submit a valid assessment', async () => {
      // Arrange
      const assessmentData = createValidAssessmentData();
      const userId = 'user-123';
      const expectedAssessment = createMockAssessment();

      mockAssessmentRepo.create.mockResolvedValue(expectedAssessment);

      // Act
      const result = await service.submitAssessment(assessmentData, userId);

      // Assert
      expect(result).toEqual(expectedAssessment);
      expect(mockAssessmentRepo.create).toHaveBeenCalledWith({
        ...assessmentData,
        employeeId: userId,
        status: AssessmentStatus.SUBMITTED,
        submittedAt: expect.any(Date),
      });
      expect(mockEventService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'assessment.submitted',
          aggregateId: expectedAssessment.id,
        })
      );
    });

    it('should throw ValidationError for invalid skill level', async () => {
      // Arrange
      const invalidData = { ...createValidAssessmentData(), selfAssessedLevel: 5 };
      const userId = 'user-123';

      // Act & Assert
      await expect(
        service.submitAssessment(invalidData, userId)
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### Performance Monitoring
```typescript
// File: apps/api/src/middleware/performance.middleware.ts
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        userAgent: req.get('User-Agent'),
      });
    }

    // Send metrics to monitoring system
    metrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status_code: res.statusCode.toString(),
    });
  });

  next();
};
```

## 📊 Quality Assurance Framework

### Automated Testing Pipeline
```yaml
# File: .github/workflows/quality-assurance.yml
name: Quality Assurance

on:
  pull_request:
    branches: [main, develop]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup test environment
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Cleanup
        run: docker-compose -f docker-compose.test.yml down
```

### Deployment Strategy
```bash
# Blue-Green Deployment Script
#!/bin/bash

# File: scripts/deploy.sh
set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./deploy.sh <environment> <version>"
  exit 1
fi

echo "Deploying version $VERSION to $ENVIRONMENT"

# Build and tag Docker images
docker build -t 3dx-talent-matrix/web:$VERSION apps/web
docker build -t 3dx-talent-matrix/api:$VERSION apps/api

# Push to registry
docker push 3dx-talent-matrix/web:$VERSION
docker push 3dx-talent-matrix/api:$VERSION

# Deploy to Kubernetes
kubectl set image deployment/web-deployment web=3dx-talent-matrix/web:$VERSION
kubectl set image deployment/api-deployment api=3dx-talent-matrix/api:$VERSION

# Wait for rollout
kubectl rollout status deployment/web-deployment
kubectl rollout status deployment/api-deployment

# Run health checks
./scripts/health-check.sh $ENVIRONMENT

echo "Deployment completed successfully"
```

---

*This comprehensive implementation guide provides the foundation for building a world-class Skills Intelligence Platform with enterprise-grade capabilities, proper development workflows, and quality assurance processes.*
