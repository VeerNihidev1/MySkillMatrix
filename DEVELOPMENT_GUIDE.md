# 3DXTalentMatrix - Development Guide

## Architecture Overview

### Component Architecture
The application follows a modular component architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│                App.tsx                  │
│         (Main Application)              │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│ Auth  │    │Dashboard│   │ Admin   │
│ Layer │    │Components│   │ Panel   │
└───────┘    └─────────┘   └─────────┘
```

### Data Flow Architecture
```
User Action → Component → Custom Hook → Data Layer → LocalStorage
     ↑                                                      │
     └──────────── State Update ←─────────────────────────┘
```

### Hook-Based State Management
- **useAuth**: Authentication and user management
- **useSkillMatrix**: Skill categories and assessment data
- **useAssessment**: Assessment lifecycle management
- **useDarkMode**: Theme management

## Core Components Deep Dive

### 1. AssessmentDashboard Component
**Purpose**: Self-assessment interface for employees
**Key Features**:
- Dynamic skill category rendering
- Real-time skill level updates
- Assessment submission workflow
- Progress tracking

**Props Interface**:
```typescript
interface AssessmentDashboardProps {
  onCreateAssessment?: (assessment: Omit<SelfAssessment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSubmitAssessment?: (assessment: Omit<SelfAssessment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBack?: () => void;
}
```

**State Management**:
```typescript
const [currentAssessment, setCurrentAssessment] = useState<SelfAssessment | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showSubmitModal, setShowSubmitModal] = useState(false);
```

### 2. ManagerDashboard Component
**Purpose**: Team management and oversight interface
**Key Features**:
- Team member skill overview
- Pending review management
- Gap analysis generation
- SLA monitoring

**Data Dependencies**:
```typescript
const { authState, getEmployeesByManager } = useAuth();
const { categories, stats } = useSkillMatrix(authState.user?.role || 'manager');
const {
  getPendingManagerReviews,
  generateAssessmentReport,
  selfAssessments,
  managerAssessments
} = useAssessment();
```

### 3. GapAnalysisDashboard Component
**Purpose**: Skill gap visualization and recommendations
**Key Features**:
- Interactive gap analysis charts
- Development priority categorization
- Skill comparison matrices
- Actionable recommendations

**Chart Configuration**:
```typescript
const chartData = useMemo(() => {
  return report.categoryBreakdown.map(category => ({
    name: category.categoryName,
    gap: Math.abs(category.averageGap),
    priority: category.priority,
  }));
}, [report.categoryBreakdown]);
```

## Custom Hooks Implementation

### useSkillMatrix Hook
**Purpose**: Manages skill categories and user skill levels

```typescript
export const useSkillMatrix = (role: string = 'devops') => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const getRoleSkills = (selectedRole: string): SkillCategory[] => {
    const baseSkills = [...initialSkillCategories, ...projectManagerSkills];
    
    switch (selectedRole) {
      case 'project-manager':
        return baseSkills;
      case 'solution-architect':
        return [...baseSkills, ...solutionArchitectSkills];
      case 'delivery-manager':
        return [...baseSkills, ...deliveryManagerSkills];
      default:
        return baseSkills;
    }
  };

  // Data persistence and state management
  useEffect(() => {
    const savedData = localStorage.getItem(`skillMatrixData_${role}`);
    if (savedData) {
      // Load and deserialize data
    } else {
      setCategories(getRoleSkills(role));
    }
  }, [role]);

  return {
    categories,
    stats,
    updateSkillLevel,
    addSkill,
    updateSkill,
    deleteSkill,
    exportData,
    importData
  };
};
```

### useAssessment Hook
**Purpose**: Manages assessment lifecycle and data

```typescript
export const useAssessment = (employeeId?: string) => {
  const [assessmentCycles, setAssessmentCycles] = useState<AssessmentCycle[]>([]);
  const [selfAssessments, setSelfAssessments] = useState<SelfAssessment[]>([]);
  const [managerAssessments, setManagerAssessments] = useState<ManagerAssessment[]>([]);

  // Assessment creation
  const createSelfAssessment = useCallback((assessmentData: Omit<SelfAssessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAssessment: SelfAssessment = {
      ...assessmentData,
      id: `self-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSelfAssessments(prev => [...prev, newAssessment]);
    localStorage.setItem('selfAssessments', JSON.stringify([...selfAssessments, newAssessment]));
    
    return newAssessment;
  }, [selfAssessments]);

  // Assessment submission
  const submitSelfAssessment = useCallback((assessmentId: string) => {
    setSelfAssessments(prev => 
      prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, status: 'submitted', updatedAt: new Date() }
          : assessment
      )
    );
  }, []);

  return {
    assessmentCycles,
    selfAssessments,
    managerAssessments,
    createSelfAssessment,
    updateSelfAssessment,
    submitSelfAssessment,
    generateAssessmentReport
  };
};
```

## Data Models and Types

### Core Types
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  managerId?: string;
  avatar?: string;
  isFirstLogin: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-4 scale
  lastUpdated: Date;
  notes?: string;
}

export interface SelfAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  skills: SkillAssessment[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: StatusChange[];
}
```

### Assessment Types
```typescript
export interface SkillAssessment {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: number;
  selfAssessedLevel: number;
  managerAssessedLevel?: number;
  notes?: string;
  evidence?: string[];
}

export interface GapAnalysisReport {
  employeeId: string;
  employeeName: string;
  cycleId: string;
  overallStats: {
    totalSkills: number;
    averageCurrentLevel: number;
    averageSelfAssessed: number;
    averageManagerAssessed: number;
    overallGap: number;
    skillsNeedingDevelopment: number;
    skillsOverestimated: number;
    skillsUnderestimated: number;
  };
  categoryBreakdown: CategoryGapAnalysis[];
  gapAnalysis: SkillGapAnalysis[];
  developmentPriorities: {
    high: SkillGapAnalysis[];
    medium: SkillGapAnalysis[];
    low: SkillGapAnalysis[];
  };
  generatedAt: Date;
}
```

## State Management Patterns

### 1. Local Component State
Use for UI-specific state that doesn't need to be shared:
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');
```

### 2. Custom Hook State
Use for business logic and shared state:
```typescript
const { categories, updateSkillLevel } = useSkillMatrix(userRole);
const { assessments, createAssessment } = useAssessment();
```

### 3. Context-Based State
Use for global application state:
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Data Persistence Strategy

### LocalStorage Implementation
```typescript
// Save data with versioning
const saveToLocalStorage = <T>(key: string, data: T, version: string = '1.0') => {
  const payload = {
    data,
    version,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(payload));
};

// Load data with migration support
const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const payload = JSON.parse(stored);
    
    // Handle version migrations
    if (payload.version !== CURRENT_VERSION) {
      return migrateData(payload.data, payload.version);
    }
    
    return payload.data;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};
```

### Data Migration Strategy
```typescript
const migrateData = (data: any, fromVersion: string): any => {
  switch (fromVersion) {
    case '1.0':
      // Migrate from v1.0 to v1.1
      return migrateV1ToV1_1(data);
    case '1.1':
      // Migrate from v1.1 to v1.2
      return migrateV1_1ToV1_2(data);
    default:
      return data;
  }
};
```

## Performance Optimization

### Component Optimization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return categories.reduce((acc, category) => {
    return acc + category.skills.length;
  }, 0);
}, [categories]);

// Memoize components to prevent unnecessary re-renders
const MemoizedSkillCard = React.memo(SkillCard);

// Optimize callback functions
const handleSkillUpdate = useCallback((skillId: string, level: number) => {
  updateSkillLevel(skillId, level);
}, [updateSkillLevel]);
```

### Bundle Optimization
```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const GapAnalysisDashboard = lazy(() => import('./components/GapAnalysisDashboard'));

// Code splitting by route
const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/gap-analysis" element={<GapAnalysisDashboard />} />
    </Routes>
  </Suspense>
);
```

## Error Handling Patterns

### Component Error Boundaries
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const executeAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, loading, executeAsync };
};
```

## Security Considerations

### Input Validation
```typescript
const validateSkillLevel = (level: number): boolean => {
  return Number.isInteger(level) && level >= 0 && level <= 4;
};

const sanitizeUserInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Authentication Security
```typescript
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token);
    return decoded && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};
```

## Future Development Roadmap

### Phase 1: Core Enhancements
- Real-time collaboration features
- Advanced analytics dashboard
- Mobile responsive design improvements
- Offline capability with sync

### Phase 2: Integration Features
- LDAP/Active Directory integration
- REST API development
- Third-party tool integrations (Slack, Teams)
- Export capabilities (PDF, Excel)

### Phase 3: Advanced Features
- Machine learning skill recommendations
- Automated skill gap analysis
- Career path planning
- Competency mapping

### Phase 4: Enterprise Features
- Multi-tenant architecture
- Advanced security features
- Audit logging
- Compliance reporting

---

*This guide serves as the technical foundation for 3DXTalentMatrix development and maintenance.*
