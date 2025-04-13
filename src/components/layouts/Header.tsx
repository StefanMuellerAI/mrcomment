import React from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo';

interface HeaderProps {
  isAdmin: boolean;
  userEmail: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  userEmail,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  const handleToggleDashboard = () => {
    if (isAdminRoute) {
      navigate('/comment-tool');
    } else {
      navigate('/admin');
    }
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-10">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Logo className="h-8 w-auto" />
          <span className="ml-3 text-xl font-medium text-gray-900">MrComment</span>
        </div>
        
        <div className="flex items-center">
          {isAdmin && (
            <button
              onClick={handleToggleDashboard}
              className="text-sm text-gray-700 mr-6 flex items-center"
            >
              {isAdminRoute ? 'Zu Tools wechseln' : 'Zum Admin-Dashboard'}
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          )}
          
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">{userEmail}</span>
            <button
              onClick={onLogout}
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 