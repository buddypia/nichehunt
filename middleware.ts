import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // パスから言語を検出
  const pathnameHasLocale = ['ja', 'en'].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // 言語設定の決定
  let locale = 'en'; // デフォルト値（英語）
  
  if (pathnameHasLocale) {
    // パスに /ja または /en が含まれている場合
    if (pathname.startsWith('/ja')) {
      locale = 'ja';
    } else if (pathname.startsWith('/en')) {
      locale = 'en';
    }
  }
  
  // デバッグ情報（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, Locale: ${locale}`);
  }
  
  // Supabaseセッション更新
  const response = await updateSession(request);
  
  // レスポンスヘッダーに国コードを追加
  if (response) {
    response.headers.set('x-locale', locale);
    // デバッグ用にコンソールにも出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Setting headers - locale: ${locale}`);
    }
    return response;
  }
  
  // 新しいレスポンスを作成してヘッダーを追加
  const newResponse = NextResponse.next();
  newResponse.headers.set('x-locale', locale);
  return newResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
