import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ id: string; name: string }>;
  selectedLevel: number | null;
  onLevelChange: (level: number | null) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedLevel,
  onLevelChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedLevel ?? ''}
            onChange={(e) => onLevelChange(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Levels</option>
            <option value="0">Not Familiar</option>
            <option value="1">Beginner</option>
            <option value="2">Intermediate</option>
            <option value="3">Advanced</option>
            <option value="4">Expert</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;