import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // ドメインから国コードを検出
  const hostname = request.headers.get('host') || '';
  let countryCode = 'en'; // デフォルト値（英語）
  
  // ja.サブドメインの検出（ja.example.com または ja.localhost）
  if (hostname.startsWith('ja.')) {
    countryCode = 'jp';
  } else {
    countryCode = 'en';
  }
  
  // Supabaseセッション更新
  const response = await updateSession(request);
  
  // レスポンスヘッダーに国コードを追加
  if (response) {
    response.headers.set('x-country-code', countryCode);
    return response;
  }
  
  // 新しいレスポンスを作成してヘッダーを追加
  const newResponse = NextResponse.next();
  newResponse.headers.set('x-country-code', countryCode);
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
