export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager';
  department?: string;
  position?: string;
  managerId?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // -1-4 (Not Applicable, Not familiar, Beginner, Intermediate, Advanced, Expert)
  description?: string;
  lastUpdated: Date;
  isCustom?: boolean;
}

export interface UserSkillAssessment {
  id: string;
  userId: string;
  skills: Skill[];
  completedAt: Date;
  status: 'draft' | 'submitted' | 'reviewed';
  managerComments?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export interface SkillStats {
  totalSkills: number;
  averageLevel: number;
  expertSkills: number;
  categoriesCount: number;
  completionRate: number;
}

export interface TeamStats {
  totalEmployees: number;
  completedAssessments: number;
  pendingReviews: number;
  averageTeamLevel: number;
}

export const SKILL_LEVELS = [
  { value: -1, label: 'Not Applicable', color: 'bg-gray-100 text-gray-500' },
  { value: 0, label: 'Not Familiar', color: 'bg-gray-200 text-gray-600' },
  { value: 1, label: 'Beginner', color: 'bg-red-100 text-red-700' },
  { value: 2, label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  { value: 3, label: 'Advanced', color: 'bg-blue-100 text-blue-700' },
  { value: 4, label: 'Expert', color: 'bg-green-100 text-green-700' },
];