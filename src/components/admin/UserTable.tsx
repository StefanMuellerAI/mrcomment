import React from 'react';
import { Loader2, ArrowDown, Star, Trash2, ArrowUpDown } from 'lucide-react';

// Typen für die Komponente
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  customer_count: number;
  weekly_generations_used: number;
  available_generations: number;
  plan: {
    id: number;
    name: string;
    max_customers: number;
    weekly_generations: number;
  };
}

interface SortConfig {
  key: keyof AdminUser | 'plan.name' | 'plan.max_customers';
  direction: 'ascending' | 'descending';
}

interface UserTableProps {
  users: AdminUser[];
  loading: boolean;
  availablePlans: { id: number; name: string }[];
  sortConfig: SortConfig | null;
  requestSort: (key: keyof AdminUser | 'plan.name' | 'plan.max_customers') => void;
  updateUserPlan: (userId: string, planId: number) => Promise<void>;
  setUserAsAdmin: (userId: string) => Promise<void>;
  setUserAsRegular: (userId: string) => Promise<void>;
  onDeleteUser: (user: { id: string; email: string }) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  availablePlans,
  sortConfig,
  requestSort,
  updateUserPlan,
  setUserAsAdmin,
  setUserAsRegular,
  onDeleteUser
}) => {
  // Funktion zum Anzeigen des Sortierungspfeils
  const getSortIcon = (columnName: keyof AdminUser | 'plan.name' | 'plan.max_customers') => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUpDown size={14} className="ml-1 text-blue-600" /> : 
      <ArrowUpDown size={14} className="ml-1 rotate-180 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('email')}
            >
              <div className="flex items-center">
                E-Mail {getSortIcon('email')}
              </div>
            </th>
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('role')}
            >
              <div className="flex items-center">
                Rolle {getSortIcon('role')}
              </div>
            </th>
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('plan.name')}
            >
              <div className="flex items-center">
                Plan {getSortIcon('plan.name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('customer_count')}
            >
              <div className="flex items-center">
                Kunden {getSortIcon('customer_count')}
              </div>
            </th>
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('weekly_generations_used')}
            >
              <div className="flex items-center">
                Gen./Woche {getSortIcon('weekly_generations_used')}
              </div>
            </th>
            <th 
              className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Benutzer'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  Plan {user.plan.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={user.customer_count >= user.plan.max_customers ? 'text-red-600 font-semibold' : ''}>
                  {user.customer_count}/{user.plan.max_customers}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={user.weekly_generations_used >= user.available_generations ? 'text-red-600 font-semibold' : ''}>
                  {user.weekly_generations_used}/{user.available_generations}
                </span>
                {user.available_generations < user.plan.weekly_generations && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 py-0.5 px-1.5 rounded-full">
                    Limit pro Kunde
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                <div className="flex items-center space-x-4">
                  <select
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    value={user.plan.id}
                    onChange={(e) => {
                      const newPlanId = parseInt(e.target.value);
                      updateUserPlan(user.id, newPlanId);
                    }}
                    title="Plan ändern"
                  >
                    {availablePlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  
                  {user.role === 'admin' ? (
                    <button
                      onClick={() => setUserAsRegular(user.id)}
                      className="text-gray-500 hover:text-yellow-600 transition-colors"
                      title="Zu Benutzer ändern"
                    >
                      <ArrowDown size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setUserAsAdmin(user.id)}
                      className="text-gray-500 hover:text-purple-600 transition-colors"
                      title="Zu Admin ändern"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteUser({ id: user.id, email: user.email })}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Benutzer löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Keine Benutzer gefunden
        </div>
      )}
    </div>
  );
};

export default UserTable; 