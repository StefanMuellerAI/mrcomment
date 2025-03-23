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

// API-Key wird nur im Produktionsmodus von Vercel benötigt
// und über die Vercel-Konfiguration weitergeleitet
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Starts a new trend research analysis
 */
export const startTrendResearch = async (topic: string): Promise<TrendResearchResponse> => {
  try {
    const response = await api.post('/research', {
      query: topic,
      mode: 'trends'
    });
    return response.data;
  } catch (error) {
    console.error('Error starting trend research:', error);
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