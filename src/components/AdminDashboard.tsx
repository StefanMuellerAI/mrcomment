import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus } from 'lucide-react';
import { SearchInput } from './common';
import { 
  UserTable, 
  UserCreateModal, 
  UserDeleteModal,
  AdminUser,
  NewUserData
} from './admin';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, email: string} | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Suche und Sortierung
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof AdminUser | 'plan.name' | 'plan.max_customers', direction: 'ascending' | 'descending'} | null>(null);

  // Pläne für Benutzer
  const [availablePlans, setAvailablePlans] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchAvailablePlans();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.email.toLowerCase().includes(lowercasedTerm)
      ));
    }
  }, [searchTerm, users]);

  useEffect(() => {
    // Apply sorting to filtered users
    let sortedUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortedUsers.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (sortConfig.key === 'plan.name') {
          aValue = a.plan.name;
          bValue = b.plan.name;
        } else if (sortConfig.key === 'plan.max_customers') {
          aValue = a.plan.max_customers;
          bValue = b.plan.max_customers;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setFilteredUsers(sortedUsers);
    }
  }, [sortConfig]);

  // Funktion zum Sortieren der Tabelle
  const requestSort = (key: keyof AdminUser | 'plan.name' | 'plan.max_customers') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Neue Funktion zum Abrufen verfügbarer Pläne
  const fetchAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      setAvailablePlans(data || []);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message);
    }
  };

  // Neue Funktion zum Abrufen des Benutzerplans
  const getUserPlan = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan', { target_user_id: userId });
      
      if (error) throw error;
      
      return data?.plan || null;
    } catch (err) {
      console.error('Error fetching user plan:', err);
      return null;
    }
  };

  // Fügen wir eine Funktion hinzu, um die Generationszahlen für einen Benutzer abzurufen
  const getUserGenerations = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_usage', {
        target_user_id: userId
      });
      
      if (error) throw error;
      
      return data?.weekly_generations || 0;
    } catch (err) {
      console.error('Error fetching user generations:', err);
      return 0;
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users using the simpler JSON function
      const { data: usersJsonData, error: usersError } = await supabase
        .rpc('get_admin_users');

      if (usersError) throw usersError;
      
      console.log('Fetched users:', usersJsonData);
      
      // Parse JSON data into proper format
      const usersData = usersJsonData || [];
      
      // Effizientere Methode zum Abrufen von Kundenzahlen für alle Benutzer
      // Abrufen aller Kunden mit deren user_id in einem einzigen Aufruf
      const { data: allCustomersData, error: customersError } = await supabase
        .from('customers')
        .select('user_id');
        
      if (customersError) {
        console.error('Error fetching all customers:', customersError);
      }
      
      // Gruppieren der Kunden nach user_id und Zählen
      const customerCountMap: Record<string, number> = {};
      if (allCustomersData) {
        allCustomersData.forEach(customer => {
          const userId = customer.user_id;
          customerCountMap[userId] = (customerCountMap[userId] || 0) + 1;
        });
      }
      
      console.log('Customer count map:', customerCountMap);
      
      // For each user, get their role and customer count
      const usersWithData = await Promise.all(
        usersData.map(async (userData: any) => {
          // Get user role - use try/catch for better error handling
          let role = 'user'; // default role
          try {
            const { data: roleData, error: roleError } = await supabase
              .rpc('get_user_role', { target_user_id: userData.id });
            
            if (!roleError && roleData) {
              role = roleData;
            }
          } catch (error) {
            console.error('Error fetching role:', error);
            // Fallback to default role
          }
          
          // Get customer count from our map
          const customerCount = customerCountMap[userData.id] || 0;
          
          // Get user plan
          const userPlan = await getUserPlan(userData.id);
          
          // Echte Abrufzahlen für die wöchentlichen Generierungen
          const weeklyGenerationsUsed = await getUserGenerations(userData.id);
          
          return {
            id: userData.id,
            email: userData.email,
            created_at: userData.created_at,
            role: role,
            customer_count: customerCount,
            weekly_generations_used: weeklyGenerationsUsed,
            plan: userPlan || { id: 1, name: 'S', max_customers: 10, weekly_generations: 300 } // Default to Plan S if no plan found
          };
        })
      );
      
      console.log('Users with data:', usersWithData);
      setUsers(usersWithData);
      setFilteredUsers(usersWithData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Neue Funktion zum Aktualisieren des Benutzerplans
  const updateUserPlan = async (userId: string, planId: number) => {
    try {
      const { error } = await supabase
        .from('user_plans')
        .update({ 
          plan_id: planId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Hole die vollständigen Plandaten für die Aktualisierung
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, name, max_customers, weekly_generations')
        .eq('id', planId)
        .single();
        
      if (planError) throw planError;
      
      // Aktualisiere die Benutzerinformationen in der lokalen Liste mit allen relevanten Plan-Eigenschaften
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            plan: {
              id: planData.id,
              name: planData.name,
              max_customers: planData.max_customers,
              weekly_generations: planData.weekly_generations
            }
          };
        }
        return user;
      }));
      
      setSuccess(`Plan für Benutzer erfolgreich aktualisiert.`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error updating user plan:', err);
      setError(err.message);
    }
  };

  const setUserAsAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { 
        target_id: userId, 
        new_role: 'admin' 
      });
      
      if (error) throw error;
      
      // Refresh the users list
      fetchUsers();
    } catch (err: any) {
      console.error('Error setting user as admin:', err);
      setError(err.message);
    }
  };

  const setUserAsRegular = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { 
        target_id: userId, 
        new_role: 'user' 
      });
      
      if (error) throw error;
      
      // Refresh the users list
      fetchUsers();
    } catch (err: any) {
      console.error('Error setting user as regular:', err);
      setError(err.message);
    }
  };

  const handleDeleteUser = (user: { id: string, email: string }) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeletingUser(true);
      
      // Unsere RPC-Funktion zum Löschen des Benutzers verwenden
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userToDelete.id
      });
      
      if (error) throw error;
      
      // Erfolgsmeldung anzeigen und Liste aktualisieren
      setSuccess(`Benutzer ${userToDelete.email} wurde erfolgreich gelöscht.`);
      setTimeout(() => setSuccess(null), 5000);
      
      // Benutzer aus der lokalen Liste entfernen
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Modal schließen
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Fehler beim Löschen des Benutzers');
    } finally {
      setDeletingUser(false);
    }
  };

  const handleCreateUser = async (userData: NewUserData) => {
    setCreatingUser(true);
    setCreateUserError(null);
    
    try {
      // Validate input
      if (!userData.email.trim() || !userData.password.trim()) {
        throw new Error('E-Mail und Passwort sind erforderlich');
      }
      
      if (userData.password.length < 6) {
        throw new Error('Das Passwort muss mindestens 6 Zeichen haben');
      }
      
      console.log('Creating user with email:', userData.email, 'role:', userData.role, 'skipConfirmation:', userData.skipConfirmation);
      
      // Unsere RPC-Funktion zur Benutzererstellung verwenden
      const { data: userId, error: createError } = await supabase.rpc('admin_create_user', {
        user_email: userData.email,
        user_password: userData.password,
        initial_role: userData.role,
        skip_confirmation: userData.skipConfirmation
      });
      
      if (createError) throw createError;
      
      console.log('User created with ID:', userId);
      
      // Refresh user list
      await fetchUsers();
      
      // Close modal
      setShowCreateUserModal(false);
      
      // Erfolgs-Nachricht anzeigen
      setSuccess(`Benutzer ${userData.email} wurde erfolgreich erstellt.`);
      setTimeout(() => setSuccess(null), 5000); // Nach 5 Sekunden ausblenden
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      setCreateUserError(err.message || 'Fehler beim Erstellen des Benutzers');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Modals */}
      <UserCreateModal
        isOpen={showCreateUserModal}
        isCreating={creatingUser}
        error={createUserError}
        onClose={() => setShowCreateUserModal(false)}
        onSubmit={handleCreateUser}
      />

      <UserDeleteModal
        isOpen={showDeleteUserModal}
        isDeleting={deletingUser}
        userToDelete={userToDelete}
        onClose={() => setShowDeleteUserModal(false)}
        onConfirm={confirmDeleteUser}
      />

      {/* Notifications */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} />
            Benutzer
          </h2>
          
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus size={16} />
            Benutzer hinzufügen
          </button>
        </div>
        
        <div className="mb-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Nach E-Mail suchen..."
          />
        </div>
        
        <UserTable
          users={filteredUsers}
          loading={loading}
          availablePlans={availablePlans}
          sortConfig={sortConfig}
          requestSort={requestSort}
          updateUserPlan={updateUserPlan}
          setUserAsAdmin={setUserAsAdmin}
          setUserAsRegular={setUserAsRegular}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;