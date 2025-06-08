import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  // Debug logging for auth issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', user ? 'authenticated' : 'not authenticated');
    if (error) {
      console.log('[Middleware] Auth error:', error);
    }
  }

  // パブリックパスの定義（認証不要）
  // Note: saved and settings pages rely on client-side auth checks instead of middleware
  const publicPaths = [
    "/",
    "/login",
    "/auth",
    "/products",
    "/about", 
    "/community",
    "/profile",
    "/profiles",
    "/saved",      // Allow access, client-side auth check handles protection
    "/settings",   // Allow access, client-side auth check handles protection
    "/ja",
    "/ja/products",
    "/ja/about",
    "/ja/community", 
    "/ja/profile",
    "/ja/profiles",
    "/ja/saved",    // Allow access, client-side auth check handles protection
    "/ja/settings", // Allow access, client-side auth check handles protection
    "/en",
    "/en/products", 
    "/en/about",
    "/en/community",
    "/en/profile",
    "/en/profiles",
    "/en/saved",    // Allow access, client-side auth check handles protection
    "/en/settings"  // Allow access, client-side auth check handles protection
  ];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/")
  );

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Is public path:', isPublicPath, 'for path:', request.nextUrl.pathname);
  }

  if (!user && !isPublicPath) {
    // Check if this is an auth-related path that should be ignored
    const isAuthPath = request.nextUrl.pathname.startsWith('/auth/');
    if (isAuthPath) {
      return supabaseResponse;
    }
    
    // no user, potentially respond by redirecting the user to the login page
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Redirecting to signin - no user and not public path');
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
