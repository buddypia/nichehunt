import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Handle implicit flow (hash-based) callback
  if (!code) {
    // For implicit flow, we need to handle this on the client side
    return NextResponse.redirect(`${origin}/auth/callback-client${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  // Handle authorization code flow
  if (code) {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`);
      }

      if (data.session && data.user) {
        // Check if profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const username = data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`;
          const displayName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
              display_name: displayName,
              slug: username,
              avatar_url: data.user.user_metadata?.avatar_url || null,
            });

          if (insertError) {
            console.error('Profile creation error:', insertError);
          }
        }

        // Redirect to the target page
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error: any) {
      console.error('Callback error:', error);
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent('Authentication failed')}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=No authentication code provided`);
}