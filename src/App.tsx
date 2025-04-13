import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/layouts/Header';
import Sidebar from './components/layouts/Sidebar';
import CommentToolPage from './pages/CommentToolPage';
import IdeenToolPage from './pages/IdeenToolPage';
import RechercheToolPage from './pages/RechercheToolPage';
import SchreibToolPage from './pages/SchreibToolPage';
import LoginForm from './components/auth/LoginForm';
import ModalContainer from './components/common/ModalContainer';
import authService from './services/authService';
import modalService from './services/modalService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.checkSession();
      
      setIsLoggedIn(session.isLoggedIn);
      setUserEmail(session.user.email);
      setIsAdmin(session.user.isAdmin);
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleLoginSuccess = (email: string, userIsAdmin: boolean) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setIsAdmin(userIsAdmin);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setIsAdmin(false);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Gemeinsame Komponente für Tool-Pages mit Sidebar
  const ToolPageLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      <Sidebar 
        isAdmin={isAdmin}
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`flex-1 pt-16 transition-all duration-300 min-h-[calc(100vh-120px)] ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {children}
      </div>
    </>
  );

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        {/* Common Header */}
        <Header 
          isAdmin={isAdmin}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col">
          <Routes>
            {/* Admin Dashboard Route */}
            <Route 
              path="/admin" 
              element={
                isAdmin ? (
                  <ToolPageLayout>
                    <AdminDashboard />
                  </ToolPageLayout>
                ) : (
                  <Navigate to="/comment-tool" />
                )
              } 
            />
            
            {/* Tool Routes with Sidebar */}
            <Route 
              path="/comment-tool" 
              element={
                <ToolPageLayout>
                  <CommentToolPage 
                    userEmail={userEmail} 
                    isAdmin={isAdmin} 
                  />
                </ToolPageLayout>
              } 
            />
            
            <Route 
              path="/hook-tool"
              element={
                <ToolPageLayout>
                  <IdeenToolPage />
                </ToolPageLayout>
              } 
            />
            
            <Route 
              path="/recherche-tool" 
              element={
                <ToolPageLayout>
                  <RechercheToolPage 
                    userEmail={userEmail} 
                    isAdmin={isAdmin} 
                  />
                </ToolPageLayout>
              } 
            />
            
            <Route 
              path="/schreib-tool" 
              element={
                <ToolPageLayout>
                  <SchreibToolPage 
                    userEmail={userEmail} 
                    isAdmin={isAdmin} 
                  />
                </ToolPageLayout>
              } 
            />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/comment-tool" />} />
          </Routes>
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

        {/* Modal Container für alle Modals */}
        <ModalContainer />
      </div>
    </Router>
  );
}

export default App;