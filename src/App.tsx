import React, { useState } from 'react';
import { Plus, Download, BarChart3, Target, Award, Layers } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSkillMatrix } from './hooks/useSkillMatrix';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import SkillCategory from './components/SkillCategory';
import AddSkillModal from './components/AddSkillModal';
import SearchFilter from './components/SearchFilter';
import StatsCard from './components/StatsCard';
import AssessmentActions from './components/AssessmentActions';
import ManagerDashboard from './components/ManagerDashboard';
import { Skill } from './types';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const {
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
  } = useSkillMatrix();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'dashboard'>('assessment');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const filteredCategories = categories.map(category => {
    const filteredSkills = category.skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || category.id === selectedCategory;
      const matchesLevel = selectedLevel === null || skill.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    return {
      ...category,
      skills: filteredSkills,
    };
  }).filter(category => category.skills.length > 0);

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  const handleSaveSkill = (skillData: Omit<Skill, 'id' | 'lastUpdated'>) => {
    if (editingSkill) {
      updateSkill({ ...editingSkill, ...skillData });
      setEditingSkill(null);
    } else {
      addSkill(skillData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Profile */}
        <UserProfile />

        {/* Navigation Tabs for Managers */}
        {user.role === 'manager' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('assessment')}
                className={`flex-1 px-6 py-4 text-center font-medium rounded-l-xl transition-colors ${
                  activeTab === 'assessment'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                My Assessment
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 px-6 py-4 text-center font-medium rounded-r-xl transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Team Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Manager Dashboard */}
        {user.role === 'manager' && activeTab === 'dashboard' ? (
          <ManagerDashboard />
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Infrastructure & DevOps Skill Matrix
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track and visualize your technical competencies as an infrastructure and DevOps consultant.
                Assess your skills, identify growth areas, and showcase your expertise.
              </p>
            </div>

            {/* Assessment Actions */}
            <AssessmentActions
              status={assessmentStatus}
              onSubmit={submitAssessment}
              onExport={exportData}
              categories={categories}
              userName={user.name}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatsCard
                title="Total Skills"
                value={stats.totalSkills}
                icon="Target"
                color="bg-blue-500"
                description="Skills being tracked"
              />
              <StatsCard
                title="Average Level"
                value={stats.averageLevel.toFixed(1)}
                icon="BarChart3"
                color="bg-green-500"
                description="Overall competency"
              />
              <StatsCard
                title="Expert Skills"
                value={stats.expertSkills}
                icon="Award"
                color="bg-purple-500"
                description="Level 5 proficiency"
              />
              <StatsCard
                title="Categories"
                value={stats.categoriesCount}
                icon="Layers"
                color="bg-orange-500"
                description="Skill areas covered"
              />
              <StatsCard
                title="Completion"
                value={`${stats.completionRate.toFixed(0)}%`}
                icon="Target"
                color="bg-teal-500"
                description="Assessment progress"
              />
            </div>

            {/* Search and Filter */}
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
            />

            {/* Action Buttons */}
            {assessmentStatus === 'draft' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Add Custom Skill
                </button>
              </div>
            )}

            {/* Skill Categories */}
            <div className="space-y-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <SkillCategory
                    key={category.id}
                    category={category}
                    onSkillLevelChange={updateSkillLevel}
                    onEditSkill={assessmentStatus === 'draft' ? handleEditSkill : undefined}
                    onDeleteSkill={assessmentStatus === 'draft' ? deleteSkill : undefined}
                    isCollapsed={collapsedCategories.has(category.id)}
                    onToggleCollapse={() => toggleCategoryCollapse(category.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <p className="text-gray-500 text-lg">No skills match your current filters.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>

            {/* Add/Edit Skill Modal */}
            {assessmentStatus === 'draft' && (
              <AddSkillModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSkill}
                categories={categories}
                editingSkill={editingSkill}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;