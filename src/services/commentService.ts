import openaiService from './openaiService';
import customerService from './customerService';
import modalService from './modalService';
import { Customer, UserUsage } from './customerService';

export interface GeneratedComment {
  id: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Generiert Kommentare basierend auf einem ausgewählten Kunden und einem LinkedIn-Post
 */
export const generateComments = async (
  customers: Customer[],
  linkedInPost: string,
  userUsage: UserUsage | null,
  setError: (error: string | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  showLoadingMessage: (message: string) => void
): Promise<GeneratedComment[]> => {
  const selectedCustomer = customers.find(c => c.selected);
  if (!selectedCustomer || !linkedInPost.trim()) {
    return [];
  }

  // Überprüfen, ob der Benutzer sein wöchentliches Limit erreicht hat
  if (userUsage && !userUsage.can_generate_comments) {
    setError(`Sie haben Ihr wöchentliches Limit von ${userUsage.weekly_generations_limit} Generierungen erreicht. Bitte warten Sie bis zur nächsten Woche oder upgraden Sie Ihren Plan.`);
    setTimeout(() => setError(null), 5000);
    return [];
  }

  setIsLoading(true);
  showLoadingMessage("Kommentare werden generiert...");

  try {
    // Verwende den OpenAI-Service zur Generierung der Kommentare
    const comments = await openaiService.generateComments(
      selectedCustomer.name,
      selectedCustomer.style_analysis,
      linkedInPost
    );

    // Protokolliere die Generierung in der Datenbank
    await customerService.logGeneration();
    
    return comments;
  } catch (error) {
    console.error('Error generating comments:', error);
    throw new Error('Fehler bei der Generierung der Kommentare');
  } finally {
    setIsLoading(false);
  }
};

/**
 * Kopiert einen Text in die Zwischenablage
 */
export const copyToClipboard = async (
  text: string, 
  id: number, 
  setCopiedId: (id: number | null) => void
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

export default {
  generateComments,
  copyToClipboard
}; 