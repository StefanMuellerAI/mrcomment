import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface Session {
  user: User;
  isLoggedIn: boolean;
}

/**
 * Prüft, ob eine aktive Session besteht und gibt die Benutzerinformationen zurück
 */
export const checkSession = async (): Promise<Session> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    if (!session) {
      return { user: { id: '', email: '', isAdmin: false }, isLoggedIn: false };
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', session.user.id)
      .single();
    
    // If no role found or error, default to non-admin
    const isAdmin = (roleError) 
      ? false 
      : (roleData?.role_name === 'admin');
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        isAdmin
      },
      isLoggedIn: true
    };
  } catch (error) {
    console.error('Error checking session:', error);
    return { user: { id: '', email: '', isAdmin: false }, isLoggedIn: false };
  }
};

/**
 * Meldet den Benutzer ab
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Meldet einen Benutzer mit E-Mail und Passwort an
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('Keine Benutzerdaten erhalten');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', data.user.id)
      .single();
    
    // If no role found or error, default to non-admin
    const isAdmin = (roleError) 
      ? false 
      : (roleData?.role_name === 'admin');

    return {
      id: data.user.id,
      email: data.user.email || '',
      isAdmin
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export default {
  checkSession,
  logout,
  login
}; 