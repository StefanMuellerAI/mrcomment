import React from 'react';
import { MessageSquare, Lightbulb, Search, PenTool, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isAdmin: boolean;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin, isCollapsed, toggleCollapsed }) => {
  return (
    <div 
      className={`bg-white shadow-md fixed left-0 top-16 bottom-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button 
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md border border-gray-200"
        aria-label={isCollapsed ? "Sidebar expandieren" : "Sidebar minimieren"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      <nav className={`space-y-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'} overflow-y-auto h-full`}>
        <NavLink 
          to="/comment-tool" 
          className={({ isActive }) => 
            `flex items-center rounded-md text-sm font-medium ${
              isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-3'
            } ${
              isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
          title="Kommentar-Tool"
        >
          <MessageSquare className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
          {!isCollapsed && <span>Kommentar-Tool</span>}
        </NavLink>
        
        <NavLink 
          to="/ideen-tool" 
          className={({ isActive }) => 
            `flex items-center rounded-md text-sm font-medium ${
              isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-3'
            } ${
              isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
          title="Ideen-Tool"
        >
          <Lightbulb className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
          {!isCollapsed && <span>Ideen-Tool</span>}
        </NavLink>
        
        <div className="relative">
          <NavLink 
            to="/recherche-tool" 
            className={({ isActive }) => 
              `flex items-center rounded-md text-sm font-medium ${
                isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-3'
              } ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            title="Recherche-Tool"
          >
            <Search className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
            {!isCollapsed && (
              <>
                <span>Recherche-Tool</span>
                <span className="ml-auto bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </>
            )}
          </NavLink>
          {isCollapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              Soon
            </div>
          )}
        </div>
        
        <div className="relative">
          <NavLink 
            to="/schreib-tool" 
            className={({ isActive }) => 
              `flex items-center rounded-md text-sm font-medium ${
                isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-3'
              } ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            title="Schreib-Tool"
          >
            <PenTool className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
            {!isCollapsed && (
              <>
                <span>Schreib-Tool</span>
                <span className="ml-auto bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </>
            )}
          </NavLink>
          {isCollapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              Soon
            </div>
          )}
        </div>
        
        {isAdmin && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `flex items-center rounded-md text-sm font-medium ${
                isCollapsed ? 'justify-center py-3 px-2' : 'px-4 py-3'
              } ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            title="Admin Dashboard"
          >
            <Settings className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
            {!isCollapsed && <span>Admin Dashboard</span>}
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar; 