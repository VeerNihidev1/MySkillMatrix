import React from 'react';
import { Send, Download, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AssessmentActionsProps {
  status: 'draft' | 'submitted' | 'reviewed';
  onSubmit: () => void;
  onExport: () => void;
  categories: any[];
  userName: string;
}

const AssessmentActions: React.FC<AssessmentActionsProps> = ({
  status,
  onSubmit,
  onExport,
  categories,
  userName,
}) => {
  const exportToExcel = () => {
    const allSkills = categories.flatMap(cat => 
      cat.skills.map((skill: any) => ({
        'Category': cat.name,
        'Skill Name': skill.name,
        'Level': skill.level,
        'Level Name': ['Not Familiar', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][skill.level],
        'Description': skill.description || '',
        'Last Updated': skill.lastUpdated.toLocaleDateString(),
        'Custom Skill': skill.isCustom ? 'Yes' : 'No',
      }))
    );

    const ws = XLSX.utils.json_to_sheet(allSkills);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skills Assessment');
    
    // Add summary sheet
    const summary = [
      { 'Metric': 'Total Skills', 'Value': allSkills.length },
      { 'Metric': 'Average Level', 'Value': (allSkills.reduce((sum, skill) => sum + skill.Level, 0) / allSkills.length).toFixed(2) },
      { 'Metric': 'Expert Skills', 'Value': allSkills.filter(skill => skill.Level === 4).length },
      { 'Metric': 'Assessment Date', 'Value': new Date().toLocaleDateString() },
      { 'Metric': 'Employee', 'Value': userName },
    ];
    
    const summaryWs = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    XLSX.writeFile(wb, `${userName.replace(' ', '-')}-skills-assessment.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'submitted' 
              ? 'bg-green-100 text-green-700'
              : status === 'reviewed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {status === 'submitted' ? 'Submitted for Review' : 
             status === 'reviewed' ? 'Reviewed by Manager' : 'Draft'}
          </span>
          {status === 'draft' && (
            <p className="text-sm text-gray-600">
              Complete your assessment and submit for manager review
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export Excel
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Save size={20} />
            Export JSON
          </button>
          
          {status === 'draft' && (
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentActions;