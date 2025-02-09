import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Copy, Plus, Pencil, Trash, Check, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import Logo from './components/Logo';
import OpenAI from "openai";

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

  useEffect(() => {
    // Check initial auth state
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        fetchCustomers();
      }
    };
    
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchCustomers();
      } else {
        setIsLoggedIn(false);
        setCustomers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
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
        reasoning_effort: "medium"
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

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
      // Hier könnte man noch eine Fehlermeldung für den Benutzer anzeigen
      alert(error.message || 'Ein Fehler ist aufgetreten beim Speichern des Kundenprofils');
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCustomers();
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
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
        model: "o3-mini-2025-01-31",
        messages: [
          {
            "role": "developer",
            "content": [
              {
                "type": "text",
                "text": "Du bist ein hilfreicher KI-Assistent, der den folgenden gelieferten Text analysiert und dann aus der Perspektive des Kundenprofils drei Kommentare für den mitglieferten LinkedIn Beitrag schreibt. Diese sollen exakt so klingen, wie die Stilanalyse vorschreibt. Außerdem sollen die Kommentare, ohne werblich zu sein, den Lesenden für die Person hinter dem Kundenprofil neugierig machen. Verwende immer die Ansprache des mitgeschickten LinkedIn Posts. 2 kurze Sätze sind das Maximum pro Kommentar. Die Kommentare müssen so unvollkommen sein, wie die von Menschen. Die Kommentare müssen maximal nahbar sein.  "
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
        },
        reasoning_effort: "medium"
      });

      const result = response.choices[0].message.content;
      if (!result) throw new Error('No response from OpenAI');
      
      const parsedResult = JSON.parse(result) as {
        comments: Array<{
          content: string;
          timestamp: string;
        }>;
      };

      setGeneratedComments(parsedResult.comments.map((comment, index: number) => ({
        id: index + 1,
        text: comment.content
      })));
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900 ml-2">Mr. Comment</h1>
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
      <div className="pt-16">
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
                  className="flex-1 w-full resize-none rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 mb-6 px-3 py-2"
                  placeholder="Fügen Sie hier den LinkedIn Beitrag ein..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={generateComments}
                    disabled={!customers.some(c => c.selected) || !linkedInPost.trim() || isLoading}
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
                        <p className="text-sm text-gray-700">{comment.text}</p>
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
                      <textarea
                        key={index}
                        value={example}
                        onChange={(e) => {
                          const newExamples = [...formData.linkedin_examples];
                          newExamples[index] = e.target.value;
                          setFormData({ ...formData, linkedin_examples: newExamples });
                        }}
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 px-3 py-2"
                        placeholder={`LinkedIn Beispiel ${index + 1}`}
                        required
                      />
                    ))}
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
    </div>
  );
}

export default App;