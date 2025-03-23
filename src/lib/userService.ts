import { supabase } from './supabase';

// Funktion, um zu prüfen, ob ein Benutzer Inhalte generieren darf
export const canUserGenerateContent = async (userId: string): Promise<boolean> => {
  try {
    // Aktuelle wöchentliche Nutzung abrufen
    const { data: currentUsage, error: usageError } = await supabase.rpc('get_user_usage', {
      target_user_id: userId
    });
    
    if (usageError) throw usageError;
    
    // Kundenzahl abrufen
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (customerError) throw customerError;
    
    // Benutzerplan abrufen
    const { data: userPlan, error: planError } = await supabase
      .rpc('get_user_plan', { target_user_id: userId });
      
    if (planError) throw planError;
    
    // Berechne verfügbare Generierungen basierend auf Kundenzahl
    const generationsPerCustomer = Math.floor(userPlan.weekly_generations / userPlan.max_customers);
    const effectiveCustomerCount = Math.min(customerCount || 0, userPlan.max_customers);
    const actualCustomerCount = Math.max(effectiveCustomerCount, 1);
    const availableGenerations = Math.min(
      generationsPerCustomer * actualCustomerCount,
      userPlan.weekly_generations
    );
    
    // Aktuelle Nutzung mit verfügbaren Generierungen vergleichen
    const weeklyGenerationsUsed = currentUsage?.weekly_generations || 0;
    return weeklyGenerationsUsed < availableGenerations;
  } catch (err) {
    console.error('Error checking user generation limit:', err);
    // Im Fehlerfall keine Generierung erlauben
    return false;
  }
};

// Funktion, um die verfügbaren Generierungen eines Benutzers abzurufen
export const getUserGenerationLimits = async (userId: string): Promise<{
  used: number;
  available: number;
  total: number;
}> => {
  try {
    // Aktuelle wöchentliche Nutzung abrufen
    const { data: currentUsage, error: usageError } = await supabase.rpc('get_user_usage', {
      target_user_id: userId
    });
    
    if (usageError) throw usageError;
    
    // Kundenzahl abrufen
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (customerError) throw customerError;
    
    // Benutzerplan abrufen
    const { data: userPlan, error: planError } = await supabase
      .rpc('get_user_plan', { target_user_id: userId });
      
    if (planError) throw planError;
    
    // Berechne verfügbare Generierungen basierend auf Kundenzahl
    const generationsPerCustomer = Math.floor(userPlan.weekly_generations / userPlan.max_customers);
    const effectiveCustomerCount = Math.min(customerCount || 0, userPlan.max_customers);
    const actualCustomerCount = Math.max(effectiveCustomerCount, 1);
    const availableGenerations = Math.min(
      generationsPerCustomer * actualCustomerCount,
      userPlan.weekly_generations
    );
    
    const weeklyGenerationsUsed = currentUsage?.weekly_generations || 0;
    
    return {
      used: weeklyGenerationsUsed,
      available: availableGenerations,
      total: userPlan.weekly_generations
    };
  } catch (err) {
    console.error('Error fetching user generation limits:', err);
    // Im Fehlerfall Standardwerte zurückgeben
    return {
      used: 0,
      available: 0,
      total: 0
    };
  }
}; 