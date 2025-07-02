import React, { useState, useMemo } from 'react';
import { Users, FileText, Clock, TrendingUp, Download, Eye, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSkillMatrix } from '../hooks/useSkillMatrix';
import StatsCard from './StatsCard';
import TeamAnalytics from './TeamAnalytics';
import * as XLSX from 'xlsx';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getAllUserAssessments, getTeamStats, categories } = useSkillMatrix();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [activeView, setActiveView] = useState<'overview' | 'analytics'>('overview');

  const assessments = getAllUserAssessments();
  const teamStats = getTeamStats();

  // Mock team members for demo - in real app, this would come from API
  const teamMembers = [
    { id: '1', name: 'John Doe', email: 'john.doe@company.com', position: 'Senior DevOps Engineer', department: 'Infrastructure' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', position: 'Cloud Architect', department: 'Cloud Operations' },
    { id: '4', name: 'Mike Johnson', email: 'mike.johnson@company.com', position: 'Site Reliability Engineer', department: 'Infrastructure' },
    { id: '5', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', position: 'DevOps Engineer', department: 'Development' },
    { id: '6', name: 'David Brown', email: 'david.brown@company.com', position: 'Infrastructure Engineer', department: 'Infrastructure' },
  ];

  const filteredAssessments = selectedEmployee 
    ? assessments.filter(a => a.userId === selectedEmployee)
    : assessments;

  const exportTeamReport = () => {
    const reportData = assessments.map(assessment => {
      const employee = teamMembers.find(m => m.id === assessment.userId);
      const skillsData = assessment.skills.map(skill => ({
        'Employee Name': employee?.name || 'Unknown',
        'Employee Email': employee?.email || 'Unknown',
        'Position': employee?.position || 'Unknown',
        'Department': employee?.department || 'Unknown',
        'Skill Name': skill.name,
        'Category': skill.category,
        'Level': skill.level,
        'Level Name': ['Not Familiar', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][skill.level],
        'Last Updated': skill.lastUpdated.toLocaleDateString(),
        'Assessment Status': assessment.status,
        'Completed At': assessment.completedAt.toLocaleDateString(),
      }));
      return skillsData;
    }).flat();

    // Create summary by category
    const categoryStats = categories.map(category => {
      const categorySkills = reportData.filter(skill => skill.Category === category.id);
      const avgLevel = categorySkills.length > 0 
        ? categorySkills.reduce((sum, skill) => sum + skill.Level, 0) / categorySkills.length 
        : 0;
      
      return {
        'Category': category.name,
        'Total Skills': category.skills.length,
        'Team Average Level': avgLevel.toFixed(2),
        'Expert Count': categorySkills.filter(skill => skill.Level === 4).length,
        'Skills Assessed': categorySkills.length,
      };
    });

    const ws1 = XLSX.utils.json_to_sheet(reportData);
    const ws2 = XLSX.utils.json_to_sheet(categoryStats);
    const wb = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Detailed Skills Report');
    XLSX.utils.book_append_sheet(wb, ws2, 'Category Summary');
    
    XLSX.writeFile(wb, `team-skills-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportIndividualReport = (assessment: any) => {
    const employee = teamMembers.find(m => m.id === assessment.userId);
    const reportData = assessment.skills.map((skill: any) => ({
      'Skill Name': skill.name,
      'Category': skill.category,
      'Level': skill.level,
      'Level Name': ['Not Familiar', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][skill.level],
      'Description': skill.description || '',
      'Last Updated': skill.lastUpdated.toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skills Assessment');
    XLSX.writeFile(wb, `${employee?.name.replace(' ', '-')}-skills-assessment.xlsx`);
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Manager role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management Dashboard</h2>
          <p className="text-gray-600">Monitor team skills, progress, and development opportunities</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Analytics
            </button>
          </div>
          
          <button
            onClick={exportTeamReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {activeView === 'analytics' ? (
        <TeamAnalytics teamData={teamStats} skillCategories={categories} />
      ) : (
        <>
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Team Members"
              value={teamMembers.length}
              icon="Users"
              color="bg-blue-500"
              description="Active employees"
            />
            <StatsCard
              title="Completed Assessments"
              value={teamStats.completedAssessments}
              icon="FileText"
              color="bg-green-500"
              description="Submitted reviews"
            />
            <StatsCard
              title="Pending Reviews"
              value={teamStats.pendingReviews}
              icon="Clock"
              color="bg-orange-500"
              description="Awaiting manager review"
            />
            <StatsCard
              title="Team Average"
              value={teamStats.averageTeamLevel.toFixed(1)}
              icon="TrendingUp"
              color="bg-purple-500"
              description="Overall skill level"
            />
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Categories</h3>
              <div className="space-y-3">
                {['Cloud Platforms', 'CI/CD & DevOps', 'Monitoring'].map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${85 - index * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{(3.4 - index * 0.2).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Opportunities</h3>
              <div className="space-y-3">
                {['Security & Compliance', 'Project Management', 'Virtualization'].map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${45 + index * 5}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{(1.8 + index * 0.1).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">John completed assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Jane updated Docker skills</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Mike submitted for review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700">Filter by employee:</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Team Members</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assessments List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Assessments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment) => {
                  const employee = teamMembers.find(m => m.id === assessment.userId);
                  const averageLevel = assessment.skills.reduce((sum, skill) => sum + skill.level, 0) / assessment.skills.length;
                  const expertSkills = assessment.skills.filter(skill => skill.level === 4).length;
                  
                  return (
                    <div key={assessment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {employee?.name || 'Unknown Employee'}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assessment.status === 'submitted' 
                                ? 'bg-green-100 text-green-700'
                                : assessment.status === 'reviewed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {assessment.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{employee?.position} • {employee?.department}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <span>Skills: {assessment.skills.length}</span>
                            <span>Average: {averageLevel.toFixed(1)}</span>
                            <span>Expert: {expertSkills}</span>
                            <span>Updated: {assessment.completedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportIndividualReport(assessment)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Export Individual Report"
                          >
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">No assessments found.</p>
                  <p className="text-gray-400 mt-2">Team members haven't submitted their assessments yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;