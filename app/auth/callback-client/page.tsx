'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

async function createProfile(user: any, supabase: any) {
  try {
    // Check if profile exists, if not create one
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('Creating new profile for user:', user.id);
      
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      
      // Check if username already exists and make it unique if needed
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      let uniqueUsername = username;
      if (existingProfile) {
        uniqueUsername = `${username}_${user.id.slice(0, 4)}`;
      }
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: uniqueUsername,
          display_name: displayName,
          slug: uniqueUsername,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Profile creation error:', insertError);
        throw insertError;
      }
      
      console.log('Profile created successfully:', newProfile);
      return newProfile;
    }
    
    return profile;
  } catch (error) {
    console.error('Error in createProfile:', error);
    throw error;
  }
}

export default function CallbackClientPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      
      try {
        // Handle hash-based OAuth callback (implicit flow)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            // Set the session manually
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) {
              console.error('Session setting error:', error);
              router.push(`/auth/signin?error=${encodeURIComponent(error.message)}`);
              return;
            }
            
            if (data.session && data.session.user) {
              await createProfile(data.session.user, supabase);
              router.push('/');
              router.refresh();
              return;
            }
          }
        }
        
        // Handle traditional OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push(`/auth/signin?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (data.session && data.session.user) {
          await createProfile(data.session.user, supabase);
          router.push('/');
          router.refresh();
        } else {
          router.push('/auth/signin?error=No session found');
        }
      } catch (error: any) {
        console.error('Callback processing error:', error);
        router.push(`/auth/signin?error=${encodeURIComponent('Authentication failed')}`);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}