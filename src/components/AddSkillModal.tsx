import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Skill } from '../types';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: Omit<Skill, 'id' | 'lastUpdated'>) => void;
  categories: Array<{ id: string; name: string }>;
  editingSkill?: Skill | null;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingSkill,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: 0,
    description: '',
  });

  useEffect(() => {
    if (editingSkill) {
      setFormData({
        name: editingSkill.name,
        category: editingSkill.category,
        level: editingSkill.level,
        description: editingSkill.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: categories[0]?.id || '',
        level: 0,
        description: '',
      });
    }
  }, [editingSkill, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.category) {
      onSave({
        ...formData,
        name: formData.name.trim(),
        isCustom: true,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter skill name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value={0}>Not Familiar</option>
              <option value={1}>Beginner</option>
              <option value={2}>Intermediate</option>
              <option value={3}>Advanced</option>
              <option value={4}>Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add notes about your experience with this skill"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {editingSkill ? 'Update' : 'Add'} Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;