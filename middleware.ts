import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // パスから言語を検出
  const pathnameIsMissingLocale = !['ja'].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // 言語設定と国コードの決定
  let locale = 'en'; // デフォルト値（英語）
  let countryCode = 'en';
  
  if (!pathnameIsMissingLocale) {
    // パスに /ja が含まれている場合
    locale = 'ja';
    countryCode = 'jp';
  }
  
  // デバッグ情報（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, Locale: ${locale}, Country: ${countryCode}`);
  }
  
  // リダイレクト処理：ルートパスの場合のみ言語プレフィックスを追加しない
  // その他の場合は既存のパスをそのまま処理
  
  // Supabaseセッション更新
  const response = await updateSession(request);
  
  // レスポンスヘッダーに国コードを追加
  if (response) {
    response.headers.set('x-country-code', countryCode);
    response.headers.set('x-locale', locale);
    // デバッグ用にコンソールにも出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Setting headers - country: ${countryCode}, locale: ${locale}`);
    }
    return response;
  }
  
  // 新しいレスポンスを作成してヘッダーを追加
  const newResponse = NextResponse.next();
  newResponse.headers.set('x-country-code', countryCode);
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
