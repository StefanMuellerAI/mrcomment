import React, { useState } from 'react';
import { Lightbulb, Search, Loader2, Send } from 'lucide-react';
import {
  generateLinkedInHook,
  GenerateHookResponse
} from '../services/ideaService'; // Importiere nur noch die Hook-Funktion

// Kein UserEmail/isAdmin mehr nötig, falls nicht anderswo verwendet
// interface IdeenToolPageProps {
//   userEmail?: string;
//   isAdmin?: boolean;
// }

const IdeenToolPage: React.FC = () => {
  const [keyPhrase, setKeyPhrase] = useState<string>('');
  const [generatedHooks, setGeneratedHooks] = useState<GenerateHookResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Entferne den useEffect Hook für das Polling

  // Angepasste Handle-Submit Funktion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyPhrase.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedHooks(null); // Hake zurücksetzen

    try {
      const response = await generateLinkedInHook(keyPhrase);
      setGeneratedHooks(response);
    } catch (err: any) {
      console.error('Fehler beim Generieren der Hooks:', err);
      setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Lightbulb className="mr-2 text-yellow-500" />
          LinkedIn Hook Generator
        </h1>

        <p className="text-gray-700 mb-6">
          Geben Sie ein Stichwort oder Thema ein, um automatisch catchy Hook-Ideen für Ihre nächsten LinkedIn-Posts zu generieren.
        </p>

        {/* Suchformular für Hooks */}
        <form onSubmit={handleSubmit} className="mt-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="keyPhrase" className="block text-sm font-medium text-gray-700 mb-1">
                Stichwort / Thema
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="keyPhrase"
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. KI im Marketing, Führungskompetenz, ..."
                  value={keyPhrase}
                  onChange={(e) => setKeyPhrase(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                disabled={isLoading || !keyPhrase.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generiere...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Hooks generieren
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Ladezustand - optional, da im Button integriert */}
        {/* {isLoading && (...)} */}

        {/* Fehlermeldung */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-700 font-semibold">Fehler</p>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Ergebnisse (Hooks) */}
        {generatedHooks && generatedHooks.hooks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Generierte Hooks für "{generatedHooks.key_phrase}":
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {generatedHooks.hooks.map((hook, index) => (
                <li key={index} className="text-gray-700 bg-gray-50 p-3 rounded">
                  {hook}
                  {/* Hier könnte später ein Button zum Kopieren/Verwenden hinzukommen */}
                </li>
              ))}
            </ul>
          </div>
        )}
        {generatedHooks && generatedHooks.hooks.length === 0 && (
           <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-yellow-700">Für "{generatedHooks.key_phrase}" konnten keine Hooks generiert werden.</p>
          </div>
        )}

        {/* Info-Text, wenn noch nichts generiert wurde */}
        {!isLoading && !generatedHooks && !error && (
          <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <p className="text-gray-600">Geben Sie ein Thema ein, um zu starten.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeenToolPage; 