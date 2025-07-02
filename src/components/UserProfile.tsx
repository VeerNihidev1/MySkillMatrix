import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.position}</p>
            <p className="text-sm text-gray-500">{user.department}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.role === 'manager' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {user.role === 'manager' ? 'Manager' : 'Employee'}
          </span>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;