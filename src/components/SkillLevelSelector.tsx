import React from 'react';
import { SKILL_LEVELS } from '../types';

interface SkillLevelSelectorProps {
  currentLevel: number;
  onLevelChange: (level: number) => void;
  disabled?: boolean;
}

const SkillLevelSelector: React.FC<SkillLevelSelectorProps> = ({
  currentLevel,
  onLevelChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-1">
      {SKILL_LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => onLevelChange(level.value)}
          disabled={disabled}
          className={`w-8 h-8 rounded-full transition-all duration-200 ${
            currentLevel >= level.value
              ? level.color.replace('100', '500').replace('text-', 'bg-').split(' ')[0] + ' text-white shadow-md'
              : 'bg-gray-200 hover:bg-gray-300'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
          title={level.label}
        >
          <span className="text-xs font-bold">
            {level.value + 1}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SkillLevelSelector;