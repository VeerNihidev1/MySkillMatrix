# 3DXTalentMatrix - Skills Intelligence Platform

## Overview

3DXTalentMatrix is a comprehensive Skills Intelligence Platform designed to empower talent mapping, skill assessment, and professional development. The platform provides advanced analytics and intelligence capabilities for organizations to manage their workforce skills effectively.

**Tagline**: *Empowering Talent. Mapping Skills. Driving Excellence.*

## Features

### Core Functionality
- **Self-Assessment Dashboard**: Comprehensive skill evaluation across multiple categories
- **Manager Dashboard**: Team oversight, gap analysis, and performance tracking
- **Admin Dashboard**: User management, analytics, and system administration
- **Gap Analysis**: Intelligent skill gap identification and development recommendations
- **SLA Management**: Assessment deadline tracking and compliance monitoring
- **Real-time Analytics**: Interactive dashboards with charts and visualizations

### Skill Categories
- **Cloud Platforms**: AWS, Azure, Google Cloud, etc.
- **DevOps Tools**: Docker, Kubernetes, Jenkins, etc.
- **Programming Languages**: JavaScript, Python, Java, etc.
- **Project Management**: Agile/Scrum, Risk Management, Stakeholder Management
- **Project Management Tools**: Jira, Confluence, Trello, Asana
- **Architecture & Design**: System Design, Microservices, API Design
- **Enterprise Patterns**: Integration Patterns, Security Patterns

### User Roles
- **Employee**: Self-assessment, skill tracking, development planning
- **Manager**: Team oversight, assessment reviews, gap analysis
- **Admin**: Full system access, user management, analytics

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Vite** for build tooling

### State Management
- **React Hooks** (useState, useEffect, useContext)
- **Custom Hooks** for business logic
- **LocalStorage** for data persistence

### Testing
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Coverage reporting** with detailed metrics

## Installation Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd 3dx-talent-matrix
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```env
VITE_APP_NAME=3DXTalentMatrix
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000
```

### Step 4: Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5178`

### Step 5: Build for Production
```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── components/           # React components
│   ├── AssessmentDashboard.tsx
│   ├── ManagerDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── GapAnalysisDashboard.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useSkillMatrix.ts
│   ├── useAssessment.ts
│   └── ...
├── data/                # Static data and configurations
│   ├── skillsData.ts
│   ├── roleSkillsData.ts
│   ├── assessmentData.ts
│   └── ...
├── types/               # TypeScript type definitions
│   ├── index.ts
│   ├── assessment.ts
│   └── ...
├── utils/               # Utility functions
│   ├── userManager.ts
│   ├── dataUtils.ts
│   └── ...
└── __tests__/           # Test files
    ├── components/
    ├── hooks/
    └── integration/
```

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Functional components with hooks

### Naming Conventions
- **Components**: PascalCase (e.g., `AssessmentDashboard`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSkillMatrix`)
- **Types**: PascalCase (e.g., `SkillCategory`)
- **Files**: camelCase for utilities, PascalCase for components

### State Management Patterns
- **Local State**: useState for component-specific state
- **Shared State**: Custom hooks for business logic
- **Data Persistence**: LocalStorage with proper serialization

## API Integration (Future Development)

### Authentication Endpoints
```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

### Assessment Endpoints
```typescript
GET    /api/assessments
POST   /api/assessments
PUT    /api/assessments/:id
DELETE /api/assessments/:id
GET    /api/assessments/:id/report
```

### User Management Endpoints
```typescript
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/skills
```

## Testing Strategy

### Current Test Status
- **Test Suites**: 14 total (1 passing, 13 failing)
- **Unit Tests**: 126 total (90 passing, 36 failing)
- **Coverage**: 0% (Target: 80%)
- **Status**: ⚠️ Requires immediate attention

### Test Categories

#### ✅ **Working Tests**
- **Simple Tests**: Basic functionality validation
- **Password Validation**: Security requirement testing
- **User Avatar**: Component rendering tests

#### ❌ **Failing Tests**
- **User Manager**: Authentication system tests
- **Component Tests**: UI component behavior
- **Hook Tests**: Custom hook functionality

### Running Tests

#### Basic Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:components    # Component tests only
npm run test:hooks         # Hook tests only

# Watch mode for development
npm run test:watch
```

#### Test Automation
```bash
# Run comprehensive test automation
node scripts/test-automation.cjs

# Generate detailed HTML report
npm run test:report
```

### Coverage Requirements
- **Current**: 0% (Critical Issue)
- **Minimum Target**: 60% code coverage
- **Production Target**: 80% code coverage
- **Critical paths**: 90%+ coverage

### Test Issues & Fixes Needed
1. **Type System Updates**: Fix interface mismatches
2. **Authentication Mocks**: Align with actual user system
3. **Component Updates**: Match current UI implementation
4. **Coverage Collection**: Resolve TypeScript compilation errors

## Deployment

### Development Environment
```bash
npm run dev
```

### Staging Environment
```bash
npm run build:staging
npm run preview
```

### Production Environment
```bash
npm run build
npm run serve
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]
```

## Configuration

### Theme Configuration
The application supports both light and dark modes with customizable themes:

```typescript
// Theme configuration in tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

### Skill Categories Configuration
Add new skill categories in `src/data/roleSkillsData.ts`:

```typescript
export const newRoleSkills: SkillCategory[] = [
  {
    id: 'category-id',
    name: 'Category Name',
    icon: 'IconName',
    color: 'bg-color-class',
    skills: [
      {
        id: 'skill-id',
        name: 'Skill Name',
        category: 'category-id',
        level: 0,
        lastUpdated: new Date()
      }
    ]
  }
];
```

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run test suite and ensure coverage
4. Submit pull request with description
5. Code review and approval
6. Merge to main branch

### Commit Message Format
```
type(scope): description

feat(auth): add password reset functionality
fix(dashboard): resolve gap analysis rendering issue
docs(readme): update installation instructions
test(assessment): add unit tests for submission flow
```

## Testing & Quality Assurance

### Test Automation
The project includes comprehensive test automation with detailed reporting:

```bash
# Run full test automation suite
node scripts/test-automation.cjs

# View coverage report
open coverage/lcov-report/index.html

# View test summary
cat TEST_SUMMARY.md
```

### Quality Metrics
- **Current Test Coverage**: 0% (Needs immediate attention)
- **Target Coverage**: 80%
- **Test Suites**: 14 (1 passing, 13 requiring fixes)
- **Code Quality**: ESLint + Prettier configured

### Test Reports
- **HTML Coverage Report**: `coverage/lcov-report/index.html`
- **Test Summary**: `TEST_SUMMARY.md`
- **Development Guide**: `DEVELOPMENT_GUIDE.md`

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5178
npx kill-port 5178
npm run dev
```

**Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**
```bash
# Clear build cache
rm -rf dist .vite
npm run build
```

**Test Failures**
```bash
# Fix type errors first
npm run build

# Run specific test suite
npm test -- --testPathPatterns=simple.test.ts

# Check test summary for detailed issues
cat TEST_SUMMARY.md
```

### Performance Optimization
- Implement React.memo for expensive components
- Use useMemo for complex calculations
- Implement virtual scrolling for large lists
- Optimize bundle size with code splitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support and questions:
- **Email**: support@3dxtalent.com
- **Documentation**: [Internal Wiki]
- **Issue Tracker**: [GitHub Issues]

---

*Last Updated: 2025-01-10*
*Version: 1.0.0*
