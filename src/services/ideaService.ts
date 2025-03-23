import axios from 'axios';

// Define types for API requests and responses
export interface TrendResearchRequest {
  query: string;
  mode: string;
}

export interface TrendResearchResponse {
  research_id: string;
  status: string;
  trace_id: string;
}

export interface ResearchStatusResponse {
  trace_id: string;
  status: string;
  progress: number;
  progress_message: string;
  topic: string;
  summary: string | null;
  trends: TrendItem[] | null;
}

export interface TrendItem {
  title: string;
  description: string;
}

export interface TrendsResponse {
  research_id: string;
  topic: string;
  summary: string;
  trends: TrendItem[];
}

// In der Entwicklungsumgebung nutzen wir den lokalen Proxy
// In der Produktionsumgebung leitet Vercel Anfragen direkt weiter
const API_BASE_URL = '/api';

// API-Key aus der Umgebung holen, falls verfügbar (für Vercel-Umgebung)
// In der lokalen Entwicklung wird der API-Key vom Proxy-Server hinzugefügt
const API_KEY = import.meta.env.VITE_RESEARCH_API_KEY;

// API Client konfigurieren
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request-Interceptor, der den API-Key zu jeder Anfrage hinzufügt
api.interceptors.request.use(
  (config) => {
    // API-Key zu jeder Anfrage hinzufügen, wenn in der Umgebung verfügbar
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
      console.log('Added API key to request headers');
    } else {
      console.log('No API key found in environment variables');
      // In der lokalen Entwicklung wird der Key vom Proxy hinzugefügt
    }
    
    // Debugging-Info (nur in Entwicklung)
    if (import.meta.env.DEV) {
      console.log(`Sending request to: ${config.baseURL}${config.url}`);
      console.log('Headers:', JSON.stringify(config.headers));
    }
    
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

/**
 * Starts a new trend research analysis
 */
export const startTrendResearch = async (topic: string): Promise<TrendResearchResponse> => {
  try {
    console.log('Starting trend research for topic:', topic);
    const response = await api.post('/research', {
      query: topic,
      mode: 'trends'
    });
    console.log('Research started successfully');
    return response.data;
  } catch (error) {
    console.error('Error starting trend research:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status code:', error.response?.status);
      if (error.response?.status === 401) {
        throw new Error('Fehler bei der Authentifizierung. API-Key möglicherweise ungültig oder fehlt.');
      }
    }
    throw new Error('Fehler beim Starten der Trendanalyse');
  }
};

/**
 * Gets the status of a research request
 */
export const getResearchStatus = async (researchId: string): Promise<ResearchStatusResponse> => {
  try {
    const response = await api.get(`/research/${researchId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting research status:', error);
    throw new Error('Fehler beim Abrufen des Recherche-Status');
  }
};

/**
 * Gets the trends results for a completed research
 */
export const getTrendResults = async (researchId: string): Promise<TrendsResponse> => {
  try {
    const response = await api.get(`/research/${researchId}/trends`);
    return response.data;
  } catch (error) {
    console.error('Error getting trend results:', error);
    throw new Error('Fehler beim Abrufen der Trend-Ergebnisse');
  }
};

export default {
  startTrendResearch,
  getResearchStatus,
  getTrendResults
}; 