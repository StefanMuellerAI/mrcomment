import React from 'react';
import { User, Star, Trash2, Settings } from 'lucide-react';
import { AdminUser } from './UserTable';

interface UserCardProps {
  user: AdminUser;
  onEdit?: (userId: string) => void;
  onDelete: (user: { id: string; email: string }) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-gray-100 p-2 rounded-full mr-3">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.email}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Benutzer'}
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                Plan {user.plan.name}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {onEdit && (
            <button 
              onClick={() => onEdit(user.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Bearbeiten"
            >
              <Settings size={16} />
            </button>
          )}
          <button 
            onClick={() => onDelete({ id: user.id, email: user.email })}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Löschen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Kunden</p>
          <p className={`font-medium ${user.customer_count >= user.plan.max_customers ? 'text-red-600' : 'text-gray-900'}`}>
            {user.customer_count}/{user.plan.max_customers}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Generationen/Woche</p>
          <p className={`font-medium ${user.weekly_generations_used >= user.plan.weekly_generations ? 'text-red-600' : 'text-gray-900'}`}>
            {user.weekly_generations_used}/{user.plan.weekly_generations}
          </p>
        </div>
      </div>
      
      {user.role === 'admin' && (
        <div className="mt-3 flex items-center text-xs text-purple-700">
          <Star size={12} className="mr-1" />
          <span>Administrator-Berechtigung</span>
        </div>
      )}
    </div>
  );
};

export default UserCard; 