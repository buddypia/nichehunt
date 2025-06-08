import { createClient } from '@/lib/supabase/client';
import { ja } from '@/lib/i18n/translations/ja';
import { en } from '@/lib/i18n/translations/en';
import { SupportedLanguage } from '@/lib/i18n';

// Get translations based on current locale
function getTranslations(locale: SupportedLanguage = 'ja') {
  return locale === 'ja' ? ja : en;
}

// Get current locale from browser or default to 'ja'
function getCurrentLocale(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    return pathname.startsWith('/ja') ? 'ja' : pathname.includes('/') && !pathname.startsWith('/ja') ? 'en' : 'ja';
  }
  return 'ja'; // Default to Japanese
}

export async function signUp(email: string, password: string, username: string, displayName: string) {
  try {
    const locale = getCurrentLocale();
    const t = getTranslations(locale);
    const supabase = createClient();
    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new Error(t.errors.usernameAlreadyExists);
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error(t.errors.emailAlreadyRegistered);
      }
      throw new Error(authError.message || t.errors.registrationFailed);
    }

    if (!authData.user) {
      throw new Error(t.errors.userCreationFailed);
    }

    // Wait a moment for the auth to be properly set
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create profile using the service role client for initial creation
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        display_name: displayName,
        slug: username,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to sign in the user in case the profile already exists
      if (profileError.code === '23505') { // unique violation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!signInError && signInData) {
          return signInData;
        }
      }
      // For RLS errors, we might need to handle differently
      if (profileError.message.includes('row-level security')) {
        // Profile will be created on first sign in
        console.log('Profile will be created after email confirmation');
        return authData;
      }
      throw new Error(t.errors.profileCreationFailed + ': ' + profileError.message);
    }

    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const locale = getCurrentLocale();
    const t = getTranslations(locale);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error(t.errors.invalidCredentials);
      }
      throw new Error(error.message || t.errors.loginFailed);
    }

    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = createClient();
    
    // Direct OAuth URL construction to bypass PKCE issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback-client` : undefined;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const locale = getCurrentLocale();
    const t = getTranslations(locale);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || t.errors.logoutFailed);
    }
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist (PGRST116), create one
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', user.id);
        
        const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            display_name: displayName,
            slug: username,
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Profile creation error:', insertError);
          return null;
        }

        return newProfile;
      }
      
      console.error('Profile fetch error:', profileError);
      return null;
    }

    return profile;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange(callback);
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

// Helper function to get session
export async function getSession() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
