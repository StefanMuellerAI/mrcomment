import axios from 'axios';

// Typen NUR für den Hook Generator
export interface GenerateHookRequest {
  key_phrase: string;
}

export interface GenerateHookResponse {
  hooks: string[];
  key_phrase: string;
}

// Basis-URL für den Proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API-Key für die Hook Generator API
const LINKEDIN_HOOK_API_KEY = import.meta.env.VITE_LINKEDIN_HOOK_API_KEY;

// Axios Client für die Hook API
const hookApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Generiert LinkedIn Hook-Ideen für eine gegebene key_phrase.
 */
export const generateLinkedInHook = async (keyPhrase: string): Promise<GenerateHookResponse> => {
  if (!LINKEDIN_HOOK_API_KEY) {
    console.error('LinkedIn Hook API Key (VITE_LINKEDIN_HOOK_API_KEY) ist nicht gesetzt.');
    throw new Error('API-Schlüssel für Hook-Generator fehlt.');
  }
  try {
    console.log('Generiere LinkedIn Hooks für Stichwort:', keyPhrase);
    const response = await hookApi.post<GenerateHookResponse>('/generate-hook',
      { key_phrase: keyPhrase },
      {
        headers: {
          'access_token': LINKEDIN_HOOK_API_KEY // Authentifizierungs-Header
        }
      }
    );
    console.log('Hooks erfolgreich generiert:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Generieren der LinkedIn Hooks:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status Code:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      let errorMessage = 'Fehler beim Generieren der LinkedIn Hooks.';
      if (error.response?.status === 403) {
        errorMessage = 'Authentifizierung fehlgeschlagen. Ist der API-Key korrekt?';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      throw new Error(errorMessage);
    }
    throw new Error('Unbekannter Fehler beim Generieren der LinkedIn Hooks.');
  }
};

// Default export für einfache Importe (optional)
export default {
  generateLinkedInHook
}; 