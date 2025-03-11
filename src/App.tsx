import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Copy, Plus, Pencil, Trash, Check, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import Logo from './components/Logo';
import OpenAI from "openai";
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Customer {
  id: string;
  name: string;
  selected: boolean;
  style_analysis: string;
  linkedin_examples: string[];
}

interface GeneratedComment {
  id: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface CustomerFormData {
  name: string;
  style_analysis: string;
  linkedin_examples: string[];
}

interface LoginFormData {
  email: string;
  password: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [linkedInPost, setLinkedInPost] = useState("");
  const [generatedComments, setGeneratedComments] = useState<GeneratedComment[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    style_analysis: "",
    linkedin_examples: ["", "", ""]
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
        fetchCustomers();
      }
    };
    
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
        fetchCustomers();
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        setCustomers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data.map(customer => ({
        ...customer,
        selected: false
      })));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Anmeldung läuft...");
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      if (data.user) {
        setIsLoggedIn(true);
        await fetchCustomers();
      }
    } catch (error: any) {
      setLoginError(error.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsLoggedIn(false);
      setUserEmail('');
      setCustomers([]);
    } catch (error) {
      console.error('Error signing out:', error);
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

  const generateStyleAnalysis = async (examples: string[]): Promise<string> => {
    try {
      const response = await openai.chat.completions.create({
        model: "o3-mini-2025-01-31",
        messages: [
          {
            "role": "developer",
            "content": [
              {
                "type": "text",
                "text": "Du bist ein hilfreicher KI-Assistent, der die folgenden 3 LinkedIn-Beiträge des Kunden stilistisch analysiert, damit eine KI Beiträge schreiben kann, die exakt so klingen und aufgebaut sind. Lasse kein Detail aus, mag es noch so unbedeutend sein. Je besser später der individuelle Stil nachempfunden werden kann, desto besser. "
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `Analysiere nun diese 3 Beiträge:\n${examples.join('\n\n')}`
              }
            ]
          }
        ],
        response_format: {
          "type": "text"
        },
        reasoning_effort: "high"
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating style analysis:', error);
      throw new Error('Fehler bei der Stilanalyse');
    }
  };

  const handleSaveCustomer = async () => {
    // Reset form errors
    setFormErrors([]);
    
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
    setLoadingMessage("Kundenprofil wird gespeichert...");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Sie müssen angemeldet sein, um ein Kundenprofil zu speichern');
      }

      let styleAnalysis = formData.style_analysis;

      // Prüfen, ob eine neue Stilanalyse erforderlich ist
      const needsNewAnalysis = !isEditing || // Neues Profil
        (isEditing && // Bestehendes Profil mit geänderten Beispielen
          customers.find(c => c.id === isEditing)?.linkedin_examples.join('') !== 
          formData.linkedin_examples.join(''));

      if (needsNewAnalysis) {
        try {
          setLoadingMessage("Stilanalyse wird erstellt...");
          styleAnalysis = await generateStyleAnalysis(formData.linkedin_examples);
        } catch (error) {
          console.error('Error generating style analysis:', error);
          throw new Error('Die Stilanalyse konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
        }
      }

      const customerData = {
        user_id: user.id,
        name: formData.name.trim(),
        style_analysis: styleAnalysis,
        linkedin_examples: formData.linkedin_examples.map(ex => ex.trim())
      };

      if (isEditing) {
        // Zusätzliche Sicherheitsüberprüfung für das Bearbeiten
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('user_id')
          .eq('id', isEditing)
          .single();

        if (!existingCustomer || existingCustomer.user_id !== user.id) {
          throw new Error('Sie haben keine Berechtigung, dieses Kundenprofil zu bearbeiten');
        }

        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', isEditing)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(customerData);

        if (error) throw error;
      }

      await fetchCustomers();
      setShowOverlay(false);
      setIsEditing(null);
    } catch (error: any) {
      console.error('Error saving customer:', error);
      setFormErrors([error.message || 'Ein Fehler ist aufgetreten beim Speichern des Kundenprofils']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Sie müssen angemeldet sein, um ein Kundenprofil zu löschen');
      }

      // Zusätzliche Sicherheitsüberprüfung für das Löschen
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('user_id')
        .eq('id', customerToDelete)
        .single();

      if (!existingCustomer || existingCustomer.user_id !== user.id) {
        throw new Error('Sie haben keine Berechtigung, dieses Kundenprofil zu löschen');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCustomers();
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(error.message || 'Ein Fehler ist aufgetreten beim Löschen des Kundenprofils');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const generateComments = async () => {
    const selectedCustomer = customers.find(c => c.selected);
    if (!selectedCustomer || !linkedInPost.trim()) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Kommentare werden generiert...");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.5-preview",
        messages: [
          {
            "role": "system",
            "content": [
              {
                "type": "text",
                "text": "Du bist ein LinkedIn Content Creator, der für den mitgelieferten Text 6 Kommentare schreibt. Diese müssen die folgenden Regeln einhalten: 1. kurz und bündig (maximal 1-2 Sätze) 2. Der Kommentar muss den Turing Test bestehen. 3. Er darf nicht werblich klingen oder gängige Marketingphrasen enthalten. 4. Der Kommentar darf sich selbst nicht ganz so ernst nehmen. 5. Jeweils 2 Kommentare sollten positiv, neutral und negativ sein. 6. Der Kommentar muss klingen, wie Menschen sprechen. Nicht wie Menschen schreiben. 7. Eine konkrete Satzstruktur muss nicht beachtet werden. 8. Lasse den Kommentar so klingen, wie die Stilanalyse sagt."

              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `Kundenprofil:
Name: ${selectedCustomer.name}
Stilanalyse: ${selectedCustomer.style_analysis}

LinkedIn Post für den du die Kommentare schreibst:
${linkedInPost}`
              }
            ]
          }
        ],
        response_format: {
          "type": "json_schema",
          "json_schema": {
            "name": "linkedin_comments",
            "strict": true,
            "schema": {
              "type": "object",
              "properties": {
                "comments": {
                  "type": "array",
                  "description": "A list of exactly three comments on the LinkedIn post.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "content": {
                        "type": "string",
                        "description": "The text content of the comment."
                      },
                      "timestamp": {
                        "type": "string",
                        "description": "The time when the comment was made."
                      }
                    },
                    "required": [
                      "content",
                      "timestamp"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "comments"
              ],
              "additionalProperties": false
            }
          }
        }
      });

      const result = response.choices[0].message.content;
      if (!result) throw new Error('No response from OpenAI');
      
      const parsedResult = JSON.parse(result) as {
        comments: Array<{
          content: string;
          timestamp: string;
        }>;
      };

      setGeneratedComments(parsedResult.comments.map((comment, index: number) => {
        // Determine sentiment based on comment position
        let sentiment: 'positive' | 'neutral' | 'negative';
        if (index < 2) {
          // First two comments - positive
          sentiment = 'positive';
        } else if (index < 4) {
          // Middle two comments - neutral
          sentiment = 'neutral';
        } else {
          // Last two comments - negative
          sentiment = 'negative';
        }
        
        return {
          id: index + 1,
          text: comment.content,
          sentiment
        };
      }));
    } catch (error) {
      console.error('Error generating comments:', error);
      // Optional: Add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Logo className="h-20 w-20" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Mr. Comment</h2>
            <p className="mt-2 text-sm text-gray-600">
              Melden Sie sich an, um fortzufahren
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  E-Mail Adresse
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="E-Mail Adresse"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Passwort"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Anmelden'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900 ml-2">Mr. Comment</h1>
            </div>
            <div className="text-sm text-gray-600">
              {userEmail}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Customer Profiles */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">1. Kundenprofil auswählen</h2>
                  <button
                    onClick={() => handleOpenOverlay()}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-5 w-5 text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {customers.map(customer => (
                  <div
                    key={customer.id}
                    className={`p-4 hover:bg-gray-50 ${
                      customer.selected ? 'bg-blue-50 border-2 border-blue-500 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                        onClick={() => handleCustomerSelect(customer.id)}
                      >
                        <User className={`h-10 w-10 ${customer.selected ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'} rounded-full p-2`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {customer.name}
                            {customer.selected && (
                              <Check className="h-4 w-4 text-blue-600 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenOverlay(customer)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - LinkedIn Post */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">2. LinkedIn Beitrag einfügen</h2>
              </div>
              <div className="p-6 flex flex-col h-[calc(100vh-16rem)]">
                <textarea
                  value={linkedInPost}
                  onChange={(e) => setLinkedInPost(e.target.value)}
                  className="flex-1 w-full resize-none rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 mb-2 px-3 py-2"
                  placeholder="Fügen Sie hier den LinkedIn Beitrag ein..."
                />
                <div className="mb-4 text-sm">
                  {!customers.some(c => c.selected) ? (
                    <p className="text-amber-600">Bitte wählen Sie zuerst ein Kundenprofil aus.</p>
                  ) : !linkedInPost.trim() ? (
                    <p className="text-amber-600">Bitte fügen Sie einen LinkedIn Beitrag hinzu.</p>
                  ) : linkedInPost.length < 300 ? (
                    <p className="text-amber-600">Der LinkedIn Beitrag muss mindestens 300 Zeichen lang sein (aktuell: {linkedInPost.length} Zeichen).</p>
                  ) : (
                    <p className="text-green-600">Alles bereit! Sie können jetzt Kommentare generieren.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateComments}
                    disabled={!customers.some(c => c.selected) || !linkedInPost.trim() || linkedInPost.length < 300 || isLoading}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Generiere Kommentare...' : 'Kommentare generieren'}
                  </button>
                  <button
                    onClick={() => setLinkedInPost("")}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Generated Comments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">3. Generierten Kommentar auswählen</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {generatedComments.map(comment => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <p className={`text-sm p-2 rounded ${
                          comment.sentiment === 'positive' 
                            ? 'bg-green-100 text-green-800' 
                            : comment.sentiment === 'neutral'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {comment.text}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(comment.text, comment.id)}
                        className="ml-2 p-1.5 rounded-full hover:bg-gray-100"
                      >
                        {copiedId === comment.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {generatedComments.length === 0 && !isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    Wählen Sie ein Kundenprofil aus und fügen Sie einen LinkedIn Beitrag ein, um Kommentare zu generieren.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        onShowImpressum={() => setShowImpressum(true)}
        onShowDatenschutz={() => setShowDatenschutz(true)}
      />

      {/* Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isEditing ? 'Kundenprofil bearbeiten' : 'Neues Kundenprofil'}
              </h2>
              <div className="space-y-4">
                {formErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="text-sm text-red-600">
                      {formErrors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Name des Kunden"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Beispiele
                  </label>
                  <div className="space-y-2">
                    {formData.linkedin_examples.map((example, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={example}
                          onChange={(e) => {
                            const newExamples = [...formData.linkedin_examples];
                            newExamples[index] = e.target.value;
                            setFormData({ ...formData, linkedin_examples: newExamples });
                          }}
                          className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 px-3 py-2"
                          placeholder={`LinkedIn Beispiel ${index + 1}`}
                          required
                        />
                        {index >= 3 && (
                          <button
                            onClick={() => removeLinkedInExample(index)}
                            className="self-start p-2 text-red-500 hover:text-red-700"
                            type="button"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addLinkedInExample}
                      type="button"
                      className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      Weiteres Beispiel hinzufügen
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOverlay(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveCustomer}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Kundenprofil löschen
              </h2>
              <p className="text-gray-600 mb-6">
                Sind Sie sicher, dass Sie dieses Kundenprofil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impressum Modal */}
      {showImpressum && (
        <LegalModal
          title="Impressum"
          onClose={() => setShowImpressum(false)}
          content={
            <div>
              <h3>Angaben gemäß § 5 TMG</h3>
              <p>
                Stefan Müller<br />
                StefanAI – Research & Development<br />
                Graeffstr. 22<br />
                50823 Köln
              </p>

              <h3 className="mt-4">Kontakt</h3>
              <p>
                Telefon: 0221/5702984<br />
                E-Mail: info@stefanai.de
              </p>

              <h3 className="mt-4">Umsatzsteuer-ID</h3>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE347707954
              </p>

              <h3 className="mt-4">Redaktionell verantwortlich</h3>
              <p>
                Stefan Müller<br />
                Graeffstr. 22<br />
                50823 Köln
              </p>

              <h3 className="mt-4">EU-Streitschlichtung</h3>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/.<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>

              <h3 className="mt-4">Verbraucher­streit­beilegung/Universal­schlichtungs­stelle</h3>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>

              <h3 className="mt-4">Mediennachweis</h3>
              <p>
                Bilder auf dieser Homepage erstellt durch terramedia mit der KI Stable Diffusion XL.<br />
                Weitere Bilder © Stefan Müller
              </p>
            </div>
          }
        />
      )}

      {/* Datenschutz Modal */}
      {showDatenschutz && (
        <LegalModal
          title="Datenschutzerklärung"
          onClose={() => setShowDatenschutz(false)}
          content={
            <div>
              <h3>1. Datenschutz auf einen Blick</h3>
              <h4 className="mt-4">Allgemeine Hinweise</h4>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>

              <h4 className="mt-4">Datenerfassung auf dieser Website</h4>
              <p>
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt "Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
              </p>

              <h4 className="mt-4">Wie erfassen wir Ihre Daten?</h4>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.<br /><br />
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
              </p>

              <h4 className="mt-4">Wofür nutzen wir Ihre Daten?</h4>
              <p>
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Sofern über die Website Verträge geschlossen oder angebahnt werden können, werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.
              </p>

              <h4 className="mt-4">Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
              <p>
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>

              <h3 className="mt-4">2. Hosting</h3>
              <h4>IONOS</h4>
              <p>
                Anbieter ist die IONOS SE, Elgendorfer Str. 57, 56410 Montabaur (nachfolgend IONOS). Wenn Sie unsere Website besuchen, erfasst IONOS verschiedene Logfiles inklusive Ihrer IP-Adressen. Details entnehmen Sie der Datenschutzerklärung von IONOS: https://www.ionos.de/terms-gtc/terms-privacy.
              </p>

              <h3 className="mt-4">3. Allgemeine Hinweise und Pflichtinformationen</h3>
              <h4>Datenschutz</h4>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h4 className="mt-4">Hinweis zur verantwortlichen Stelle</h4>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                Stefan Müller<br />
                Graeffstr. 22<br />
                50823 Köln<br /><br />
                Telefon: 0221/5702984<br />
                E-Mail: info@stefanai.de
              </p>

              <p className="mt-4">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}

export default App;