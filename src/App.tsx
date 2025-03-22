import { useState, useEffect } from 'react';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/layouts/Header';
import CustomerProfileList from './components/features/CustomerProfileList';
import CustomerForm from './components/features/CustomerForm';
import LoginForm from './components/auth/LoginForm';
import CommentSection from './components/features/CommentSection';
import ModalContainer from './components/common/ModalContainer';
import customerService, { Customer, CustomerFormData, UserUsage } from './services/customerService';
import authService from './services/authService';
import modalService from './services/modalService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    style_analysis: "",
    linkedin_examples: ["", "", ""]
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  // Wenn ein Admin vom Dashboard in den Kommentar-Modus wechselt, lade Kunden
  useEffect(() => {
    if (isLoggedIn && isAdmin && !showAdminDashboard) {
      fetchCustomers();
      fetchUserUsage();
    }
  }, [showAdminDashboard, isAdmin, isLoggedIn]);

  const checkSession = async () => {
    try {
      const session = await authService.checkSession();
      
      setIsLoggedIn(session.isLoggedIn);
      setUserEmail(session.user.email);
      setIsAdmin(session.user.isAdmin);
      
      if (session.isLoggedIn) {
        // Lade Kunden für Administratoren im Kommentar-Tool-Modus oder für normale Benutzer
        // Admin im Dashboard-Modus lädt keine Kunden
        await fetchCustomers();
        
        // Lade die Nutzungsdaten des Benutzers
        if (!session.user.isAdmin || !showAdminDashboard) {
          await fetchUserUsage();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerService.fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchUserUsage = async () => {
    try {
      const data = await customerService.fetchUserUsage();
      setUserUsage(data);
    } catch (err) {
      console.error('Error fetching user usage:', err);
    }
  };

  const handleLoginSuccess = (email: string, userIsAdmin: boolean) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setIsAdmin(userIsAdmin);
    
    // Lade Kunden für Administratoren im Kommentar-Tool-Modus oder für normale Benutzer
    fetchCustomers();
    
    // Lade die Nutzungsdaten des Benutzers
    if (!userIsAdmin || !showAdminDashboard) {
      fetchUserUsage();
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCustomers([]);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  const handleCustomerSelect = (id: string) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, selected: true }
        : { ...customer, selected: false }
    ));
  };

  const handleOpenOverlay = (customer?: Customer) => {
    if (customer) {
      setFormData({
        name: customer.name,
        style_analysis: customer.style_analysis,
        linkedin_examples: [...customer.linkedin_examples]
      });
      setIsEditing(customer.id);
    } else {
      setFormData({
        name: "",
        style_analysis: "",
        linkedin_examples: ["", "", ""]
      });
      setIsEditing(null);
    }
    setShowOverlay(true);
  };

  const addLinkedInExample = () => {
    setFormData(prev => ({
      ...prev,
      linkedin_examples: [...prev.linkedin_examples, ""]
    }));
  };

  const removeLinkedInExample = (indexToRemove: number) => {
    if (formData.linkedin_examples.length <= 3) return;
    setFormData(prev => ({
      ...prev,
      linkedin_examples: prev.linkedin_examples.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSaveCustomer = async () => {
    // Reset form errors
    setFormErrors([]);
    
    // Überprüfen, ob der Benutzer einen weiteren Kunden erstellen kann
    if (userUsage && !userUsage.can_create_customer) {
      setFormErrors([`Sie haben Ihr Limit von ${userUsage.max_customers} Kunden erreicht. Bitte löschen Sie einen vorhandenen Kunden oder upgraden Sie Ihren Plan.`]);
      return;
    }
    
    // Validate form
    const errors: string[] = [];
    if (!formData.name.trim()) {
      errors.push("Bitte geben Sie einen Namen ein");
    }
    if (formData.linkedin_examples.length < 3) {
      errors.push("Bitte fügen Sie mindestens drei LinkedIn Beispiele hinzu");
    }
    if (!formData.linkedin_examples.every(ex => ex.trim())) {
      errors.push("Bitte füllen Sie alle LinkedIn Beispiele aus");
    }
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    modalService.showLoading("Kundenprofil wird gespeichert...");

    try {
      await customerService.saveCustomer(
        formData,
        isEditing,
        customers,
        (message) => modalService.showLoading(message)
      );

      await fetchCustomers();
      setShowOverlay(false);
      setIsEditing(null);
      
      // Nach dem Speichern eines Kunden die Nutzungsdaten aktualisieren
      await fetchUserUsage();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      setFormErrors([error.message || 'Ein Fehler ist aufgetreten beim Speichern des Kundenprofils']);
    } finally {
      setIsLoading(false);
      modalService.hideLoading();
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    setCustomerToDelete(id);
    const customerName = customers.find(c => c.id === id)?.name || '';
    
    modalService.showDeleteConfirmation(
      "Kundenprofil löschen",
      "Sind Sie sicher, dass Sie dieses Kundenprofil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      customerName,
      confirmDelete
    );
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      modalService.setDeleting(true);
      await customerService.deleteCustomer(customerToDelete);
      await fetchCustomers();
      modalService.hideDeleteConfirmation();
      setCustomerToDelete(null);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(error.message || 'Ein Fehler ist aufgetreten beim Löschen des Kundenprofils');
      modalService.hideDeleteConfirmation();
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Common Header */}
      <Header 
        isAdmin={isAdmin}
        showAdminDashboard={showAdminDashboard}
        userEmail={userEmail}
        toggleDashboard={() => setShowAdminDashboard(!showAdminDashboard)}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="flex-1 pt-16">
        {isAdmin && showAdminDashboard ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Customer Profiles */}
              <CustomerProfileList
                customers={customers}
                onSelectCustomer={handleCustomerSelect}
                onEditCustomer={handleOpenOverlay}
                onDeleteCustomer={handleDeleteCustomer}
                onAddCustomer={() => handleOpenOverlay()}
              />

              {/* Middle and Right Columns - Comment Section */}
              <div className="col-span-2">
                <CommentSection
                  customers={customers}
                  userUsage={userUsage}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  fetchUserUsage={fetchUserUsage}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer
        onShowImpressum={() => {
          fetch('/src/assets/legal/impressum.md')
            .then(response => response.text())
            .then(text => modalService.showImpressum(text))
            .catch(error => console.error('Fehler beim Laden des Impressums:', error));
        }}
        onShowDatenschutz={() => {
          fetch('/src/assets/legal/datenschutz.md')
            .then(response => response.text())
            .then(text => modalService.showDatenschutz(text))
            .catch(error => console.error('Fehler beim Laden der Datenschutzerklärung:', error));
        }}
      />

      {/* Customer Form */}
      {showOverlay && (
        <CustomerForm
          data={formData}
          errors={formErrors}
          isLoading={isLoading}
          isEditing={isEditing !== null}
          onClose={() => setShowOverlay(false)}
          onSave={handleSaveCustomer}
          onChange={setFormData}
          onAddExample={addLinkedInExample}
          onRemoveExample={removeLinkedInExample}
        />
      )}

      {/* Modal Container für alle Modals */}
      <ModalContainer />
    </div>
  );
}

export default App;