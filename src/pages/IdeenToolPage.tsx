import React, { useState, useEffect } from 'react';
import { Lightbulb, Search, Loader2, TrendingUp, CheckCircle } from 'lucide-react';
import { 
  startTrendResearch, 
  getResearchStatus, 
  getTrendResults,
  TrendItem
} from '../services/ideaService';

interface IdeenToolPageProps {
  userEmail?: string;
  isAdmin?: boolean;
}

const IdeenToolPage: React.FC<IdeenToolPageProps> = () => {
  const [topic, setTopic] = useState<string>('');
  const [researchId, setResearchId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [summary, setSummary] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for status updates when there's an active research
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (researchId && status && status !== 'completed' && status !== 'failed') {
      interval = setInterval(async () => {
        try {
          const statusResponse = await getResearchStatus(researchId);
          setStatus(statusResponse.status);
          setProgress(statusResponse.progress);
          setProgressMessage(statusResponse.progress_message);
          
          // If the research is completed, fetch the results
          if (statusResponse.status === 'completed') {
            const results = await getTrendResults(researchId);
            setSummary(results.summary);
            setTrends(results.trends);
            clearInterval(interval);
          }
          
          // Handle failure
          if (statusResponse.status === 'failed') {
            setError('Die Trendanalyse konnte nicht abgeschlossen werden.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error polling status:', err);
          setError('Fehler beim Abrufen des Recherche-Status.');
          clearInterval(interval);
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [researchId, status]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResearchId(null);
    setStatus(null);
    setProgress(0);
    setProgressMessage('');
    setSummary(null);
    setTrends(null);
    
    try {
      const response = await startTrendResearch(topic);
      setResearchId(response.research_id);
      setStatus(response.status);
    } catch (err) {
      console.error('Error starting research:', err);
      setError('Fehler beim Starten der Trendanalyse.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Lightbulb className="mr-2 text-yellow-500" />
          Ideen-Tool
        </h1>
        
        <p className="text-gray-700 mb-6">
          Mit dem Ideen-Tool können Sie aktuelle Trends zu Ihrem Thema analysieren und daraus Inspiration für neue Content-Ideen gewinnen.
        </p>
        
        {/* Search form */}
        <form onSubmit={handleSubmit} className="mt-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Thema für die Trendanalyse
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="topic"
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Nachhaltige Mode, KI im Marketing, ..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading || status === 'processing' || status === 'searching'}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading || status === 'processing' || status === 'searching'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading || status === 'processing' || status === 'searching' || !topic.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Trends analysieren'
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Progress and status */}
        {status && status !== 'completed' && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
              <p className="text-blue-700 font-medium">
                {progressMessage || 'Trendanalyse läuft...'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Results */}
        {status === 'completed' && summary && trends && (
          <div className="mb-8">
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700 font-medium">Trendanalyse abgeschlossen</p>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Zusammenfassung</h2>
            <p className="text-gray-700 mb-6">{summary}</p>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 text-blue-500" />
              Erkannte Trends
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trends.map((trend, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-lg mb-2">{trend.title}</h3>
                  <p className="text-gray-600">{trend.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Informative text when no search is active */}
        {!status && (
          <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="font-medium text-lg mb-3">So funktioniert die Trendanalyse:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Geben Sie ein Thema ein, zu dem Sie Content erstellen möchten</li>
              <li>Unsere KI durchsucht aktuelle Quellen und analysiert relevante Trends</li>
              <li>Sie erhalten eine detaillierte Übersicht über aktuelle Entwicklungen und Themen</li>
              <li>Nutzen Sie die identifizierten Trends als Inspiration für Ihre Content-Erstellung</li>
              <li>Entwickeln Sie auf Basis der Trends neue, relevante Inhalte für Ihre Zielgruppe</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeenToolPage; 