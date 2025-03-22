import React from 'react';
import { LogOut } from 'lucide-react';
import Logo from '../Logo';

interface HeaderProps {
  isAdmin: boolean;
  showAdminDashboard: boolean;
  userEmail: string;
  toggleDashboard: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  showAdminDashboard,
  userEmail,
  toggleDashboard,
  onLogout
}) => {
  return (
    <header className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="h-8 w-8" />
            <h1 className="text-xl font-semibold text-gray-900 ml-2">Mr. Comment</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-gray-700">Kommentar-Tool</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={showAdminDashboard} 
                    onChange={toggleDashboard}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Admin-Dashboard</span>
              </label>
            )}
            <div className="text-sm text-gray-600">
              {userEmail}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 