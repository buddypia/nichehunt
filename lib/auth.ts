import { createClient } from '@/lib/supabase/client';

export async function signUp(email: string, password: string, username: string) {
  try {
    const supabase = createClient();
    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new Error('このユーザー名は既に使用されています');
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
        throw new Error('このメールアドレスは既に登録されています');
      }
      throw new Error(authError.message || '登録に失敗しました');
    }

    if (!authData.user) {
      throw new Error('ユーザーの作成に失敗しました');
    }

    // Wait a moment for the auth to be properly set
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create profile using the service role client for initial creation
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        display_name: username
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
      throw new Error('プロフィールの作成に失敗しました: ' + profileError.message);
    }

    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }
      throw new Error(error.message || 'ログインに失敗しました');
    }

    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'ログアウトに失敗しました');
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
