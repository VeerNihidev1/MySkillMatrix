import React from 'react';
import { SkillCategory as SkillCategoryType, Skill } from '../types';
import SkillItem from './SkillItem';
import * as Icons from 'lucide-react';

interface SkillCategoryProps {
  category: SkillCategoryType;
  onSkillLevelChange: (skillId: string, level: number) => void;
  onEditSkill?: (skill: Skill) => void;
  onDeleteSkill?: (skillId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SkillCategory: React.FC<SkillCategoryProps> = ({
  category,
  onSkillLevelChange,
  onEditSkill,
  onDeleteSkill,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
  const averageLevel = category.skills.length > 0 
    ? category.skills.reduce((sum, skill) => sum + skill.level, 0) / category.skills.length
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className={`${category.color} p-4 cursor-pointer transition-all duration-200 hover:opacity-90`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <IconComponent size={24} />
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm opacity-90">
                {category.skills.length} skills • Avg level: {averageLevel.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="text-2xl font-light">
            {isCollapsed ? '+' : '−'}
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.skills.map((skill) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                onLevelChange={onSkillLevelChange}
                onEdit={onEditSkill}
                onDelete={onDeleteSkill}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCategory;