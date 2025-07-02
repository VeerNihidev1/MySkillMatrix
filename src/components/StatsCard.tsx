import React from 'react';
import * as Icons from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Icons;
  color: string;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, description }) => {
  const IconComponent = (Icons as any)[icon] || Icons.Circle;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <IconComponent className="text-white" size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;