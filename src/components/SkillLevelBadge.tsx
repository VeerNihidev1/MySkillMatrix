import React from 'react';
import { SKILL_LEVELS } from '../types';

interface SkillLevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const SkillLevelBadge: React.FC<SkillLevelBadgeProps> = ({ level, size = 'md' }) => {
  const skillLevel = SKILL_LEVELS[level];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${skillLevel.color} ${sizeClasses[size]}`}>
      {skillLevel.label}
    </span>
  );
};

export default SkillLevelBadge;