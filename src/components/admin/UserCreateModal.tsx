import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface UserCreateModalProps {
  isOpen: boolean;
  isCreating: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (userData: NewUserData) => Promise<void>;
}

export interface NewUserData {
  email: string;
  password: string;
  role: 'user' | 'admin';
  skipConfirmation: boolean;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  isCreating,
  error,
  onClose,
  onSubmit
}) => {
  const [userData, setUserData] = useState<NewUserData>({
    email: '',
    password: '',
    role: 'user',
    skipConfirmation: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (role: 'user' | 'admin') => {
    setUserData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Neuen Benutzer erstellen</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full p-2 border border-gray-300 rounded-md" 
              value={userData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <p className="text-gray-500 text-xs mt-1">Mindestens 6 Zeichen</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Benutzerrolle
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="role"
                  value="user"
                  checked={userData.role === 'user'}
                  onChange={() => handleRoleChange('user')}
                />
                <span className="ml-2">Benutzer</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="role"
                  value="admin"
                  checked={userData.role === 'admin'}
                  onChange={() => handleRoleChange('admin')}
                />
                <span className="ml-2">Administrator</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="skipConfirmation"
                className="form-checkbox"
                checked={userData.skipConfirmation}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-700">
                Benutzer ohne E-Mail-Bestätigung aktivieren
              </span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2"
              onClick={onClose}
              disabled={isCreating}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Erstelle...
                </>
              ) : (
                'Benutzer erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal; 