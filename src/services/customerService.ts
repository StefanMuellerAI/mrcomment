import { supabase } from '../lib/supabase';
import openaiService from './openaiService';

export interface Customer {
  id: string;
  name: string;
  selected: boolean;
  style_analysis: string;
  linkedin_examples: string[];
}

export interface CustomerFormData {
  name: string;
  style_analysis: string;
  linkedin_examples: string[];
}

export interface UserUsage {
  customer_count: number;
  max_customers: number;
  weekly_generations: number;
  weekly_generations_limit: number;
  can_create_customer: boolean;
  can_generate_comments: boolean;
}

/**
 * Lädt die Kunden des aktuellen Benutzers
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found');
      return [];
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(customer => ({
      ...customer,
      selected: false
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

/**
 * Lädt die Nutzungsdaten des aktuellen Benutzers
 */
export const fetchUserUsage = async (): Promise<UserUsage | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_usage');
    
    if (error) throw error;
    
    return data as UserUsage;
  } catch (err) {
    console.error('Error fetching user usage:', err);
    return null;
  }
};

/**
 * Speichert ein Kundenprofil
 */
export const saveCustomer = async (
  formData: CustomerFormData, 
  isEditing: string | null,
  customers: Customer[],
  setLoadingMessage: (message: string) => void
): Promise<void> => {
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
        styleAnalysis = await openaiService.generateStyleAnalysis(formData.linkedin_examples);
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
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
};

/**
 * Löscht ein Kundenprofil
 */
export const deleteCustomer = async (customerToDelete: string): Promise<void> => {
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
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Zeichnet eine Kommentargenerierung in der Datenbank auf
 */
export const logGeneration = async (): Promise<void> => {
  try {
    await supabase.rpc('log_generation');
  } catch (error) {
    console.error('Error logging generation:', error);
  }
};

export default {
  fetchCustomers,
  fetchUserUsage,
  saveCustomer,
  deleteCustomer,
  logGeneration
}; 