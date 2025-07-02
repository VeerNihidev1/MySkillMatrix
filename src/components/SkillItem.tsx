import React from 'react';
import { Skill } from '../types';
import SkillLevelBadge from './SkillLevelBadge';
import SkillLevelSelector from './SkillLevelSelector';
import { Pencil, Trash2 } from 'lucide-react';

interface SkillItemProps {
  skill: Skill;
  onLevelChange: (skillId: string, level: number) => void;
  onEdit?: (skill: Skill) => void;
  onDelete?: (skillId: string) => void;
  isEditing?: boolean;
}

const SkillItem: React.FC<SkillItemProps> = ({
  skill,
  onLevelChange,
  onEdit,
  onDelete,
  isEditing = false,
}) => {
  return (
    <div className="group bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {skill.name}
          </h4>
          {skill.description && (
            <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
          )}
          <div className="mt-2">
            <SkillLevelBadge level={skill.level} size="sm" />
          </div>
        </div>
        
        {skill.isCustom && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(skill)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit skill"
              >
                <Pencil size={12} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(skill.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete skill"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <SkillLevelSelector
          currentLevel={skill.level}
          onLevelChange={(level) => onLevelChange(skill.id, level)}
          disabled={isEditing}
        />
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        Updated: {skill.lastUpdated.toLocaleDateString()}
      </div>
    </div>
  );
};

export default SkillItem;