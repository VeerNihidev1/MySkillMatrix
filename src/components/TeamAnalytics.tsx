import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

interface TeamAnalyticsProps {
  teamData: any;
  skillCategories: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ teamData, skillCategories }) => {
  // Mock comprehensive team data for visualization
  const skillDistributionData = skillCategories.map((category, index) => ({
    name: category.name.split(' ')[0], // Shortened names for better display
    avgLevel: Math.random() * 4 + 1,
    expertCount: Math.floor(Math.random() * 5) + 1,
    totalSkills: category.skills.length,
  }));

  const levelDistributionData = [
    { name: 'Not Familiar', value: 15, color: '#9CA3AF' },
    { name: 'Beginner', value: 25, color: '#EF4444' },
    { name: 'Intermediate', value: 35, color: '#F59E0B' },
    { name: 'Advanced', value: 20, color: '#3B82F6' },
    { name: 'Expert', value: 5, color: '#10B981' },
  ];

  const teamProgressData = [
    { month: 'Jan', avgLevel: 2.1, assessments: 8 },
    { month: 'Feb', avgLevel: 2.3, assessments: 12 },
    { month: 'Mar', avgLevel: 2.5, assessments: 15 },
    { month: 'Apr', avgLevel: 2.7, assessments: 18 },
    { month: 'May', avgLevel: 2.9, assessments: 20 },
    { month: 'Jun', avgLevel: 3.1, assessments: 22 },
  ];

  const radarData = [
    { subject: 'Cloud', A: 3.2, B: 2.8, fullMark: 4 },
    { subject: 'Containers', A: 2.9, B: 3.1, fullMark: 4 },
    { subject: 'IaC', A: 3.5, B: 2.5, fullMark: 4 },
    { subject: 'CI/CD', A: 3.0, B: 3.2, fullMark: 4 },
    { subject: 'Monitoring', A: 2.7, B: 2.9, fullMark: 4 },
    { subject: 'Security', A: 2.4, B: 3.0, fullMark: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Average</p>
              <p className="text-3xl font-bold text-blue-600">3.2</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp size={12} />
                +0.3 from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">24</p>
              <p className="text-xs text-gray-500">Across 8 departments</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expert Skills</p>
              <p className="text-3xl font-bold text-purple-600">127</p>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <Award size={12} />
                Level 4+ proficiency
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-orange-600">+18%</p>
              <p className="text-xs text-orange-600">Quarterly improvement</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgLevel" fill="#3B82F6" name="Average Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Level Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Skill Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {levelDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Team Progress Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Progress Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={teamProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgLevel" stroke="#3B82F6" strokeWidth={3} name="Average Level" />
              <Line type="monotone" dataKey="assessments" stroke="#10B981" strokeWidth={2} name="Completed Assessments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team Comparison Radar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 4]} />
              <Radar name="Infrastructure Team" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="DevOps Team" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Skills Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Skills Analysis</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Skills</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Expert Count</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                </tr>
              </thead>
              <tbody>
                {skillDistributionData.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.totalSkills}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.avgLevel >= 3 ? 'bg-green-100 text-green-700' :
                        category.avgLevel >= 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {category.avgLevel.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{category.expertCount}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(category.avgLevel / 4) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;