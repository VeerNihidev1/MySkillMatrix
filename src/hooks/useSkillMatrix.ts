import { useState, useEffect, useMemo } from 'react';
import { SkillCategory, Skill, SkillStats, UserSkillAssessment, TeamStats } from '../types';
import { initialSkillCategories } from '../data/skillsData';
import { useAuth } from '../contexts/AuthContext';

export const useSkillMatrix = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [assessmentStatus, setAssessmentStatus] = useState<'draft' | 'submitted' | 'reviewed'>('draft');

  // Load user-specific data from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const savedData = localStorage.getItem(`skillMatrixData_${user.id}`);
    const savedStatus = localStorage.getItem(`assessmentStatus_${user.id}`);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const categoriesWithDates = parsed.map((cat: any) => ({
          ...cat,
          skills: cat.skills.map((skill: any) => ({
            ...skill,
            lastUpdated: new Date(skill.lastUpdated),
          })),
        }));
        setCategories(categoriesWithDates);
      } catch (error) {
        console.error('Error loading saved data:', error);
        setCategories(initialSkillCategories);
      }
    } else {
      setCategories(initialSkillCategories);
    }

    if (savedStatus) {
      setAssessmentStatus(savedStatus as 'draft' | 'submitted' | 'reviewed');
    }
  }, [user]);

  // Save user-specific data to localStorage whenever categories change
  useEffect(() => {
    if (categories.length > 0 && user) {
      localStorage.setItem(`skillMatrixData_${user.id}`, JSON.stringify(categories));
    }
  }, [categories, user]);

  // Save assessment status
  useEffect(() => {
    if (user) {
      localStorage.setItem(`assessmentStatus_${user.id}`, assessmentStatus);
    }
  }, [assessmentStatus, user]);

  const updateSkillLevel = (skillId: string, level: number) => {
    if (assessmentStatus === 'submitted') return; // Prevent editing submitted assessments
    
    setCategories(prev => prev.map(category => ({
      ...category,
      skills: category.skills.map(skill =>
        skill.id === skillId
          ? { ...skill, level, lastUpdated: new Date() }
          : skill
      ),
    })));
  };

  const addSkill = (newSkill: Omit<Skill, 'id' | 'lastUpdated'>) => {
    if (assessmentStatus === 'submitted') return;
    
    const skill: Skill = {
      ...newSkill,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
    };

    setCategories(prev => prev.map(category =>
      category.id === skill.category
        ? { ...category, skills: [...category.skills, skill] }
        : category
    ));
  };

  const updateSkill = (updatedSkill: Skill) => {
    if (assessmentStatus === 'submitted') return;
    
    setCategories(prev => prev.map(category => ({
      ...category,
      skills: category.skills.map(skill =>
        skill.id === updatedSkill.id
          ? { ...updatedSkill, lastUpdated: new Date() }
          : skill
      ),
    })));
  };

  const deleteSkill = (skillId: string) => {
    if (assessmentStatus === 'submitted') return;
    
    setCategories(prev => prev.map(category => ({
      ...category,
      skills: category.skills.filter(skill => skill.id !== skillId),
    })));
  };

  const submitAssessment = () => {
    setAssessmentStatus('submitted');
    
    // Save assessment to global storage for manager access
    const assessment: UserSkillAssessment = {
      id: `assessment-${user?.id}-${Date.now()}`,
      userId: user?.id || '',
      skills: categories.flatMap(cat => cat.skills),
      completedAt: new Date(),
      status: 'submitted',
    };
    
    const existingAssessments = JSON.parse(localStorage.getItem('allAssessments') || '[]');
    const updatedAssessments = existingAssessments.filter((a: UserSkillAssessment) => a.userId !== user?.id);
    updatedAssessments.push(assessment);
    localStorage.setItem('allAssessments', JSON.stringify(updatedAssessments));
  };

  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const stats: SkillStats = useMemo(() => {
    const allSkills = categories.flatMap(cat => cat.skills);
    const assessedSkills = allSkills.filter(skill => skill.level > 0);
    
    return {
      totalSkills: allSkills.length,
      averageLevel: allSkills.length > 0 
        ? allSkills.reduce((sum, skill) => sum + skill.level, 0) / allSkills.length 
        : 0,
      expertSkills: allSkills.filter(skill => skill.level === 4).length,
      categoriesCount: categories.length,
      completionRate: allSkills.length > 0 ? (assessedSkills.length / allSkills.length) * 100 : 0,
    };
  }, [categories]);

  const exportData = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `skill-matrix-${user?.name.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Manager functions
  const getAllUserAssessments = (): UserSkillAssessment[] => {
    const assessments = JSON.parse(localStorage.getItem('allAssessments') || '[]');
    return assessments.map((assessment: any) => ({
      ...assessment,
      completedAt: new Date(assessment.completedAt),
      reviewedAt: assessment.reviewedAt ? new Date(assessment.reviewedAt) : undefined,
      skills: assessment.skills.map((skill: any) => ({
        ...skill,
        lastUpdated: new Date(skill.lastUpdated),
      })),
    }));
  };

  const getTeamStats = (): TeamStats => {
    const assessments = getAllUserAssessments();
    const allSkills = assessments.flatMap(a => a.skills);
    
    return {
      totalEmployees: 2, // Mock data
      completedAssessments: assessments.filter(a => a.status === 'submitted').length,
      pendingReviews: assessments.filter(a => a.status === 'submitted').length,
      averageTeamLevel: allSkills.length > 0 
        ? allSkills.reduce((sum, skill) => sum + skill.level, 0) / allSkills.length 
        : 0,
    };
  };

  return {
    categories,
    collapsedCategories,
    stats,
    assessmentStatus,
    updateSkillLevel,
    addSkill,
    updateSkill,
    deleteSkill,
    submitAssessment,
    toggleCategoryCollapse,
    exportData,
    getAllUserAssessments,
    getTeamStats,
  };
};