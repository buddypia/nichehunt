'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Mail, Lock, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/auth';
import { useTypedTranslations } from '@/lib/i18n/useTranslations';
import { SupportedLanguage, getLocalizedPath } from '@/lib/i18n';

export default function SignInClient() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as SupportedLanguage || 'ja';
  const { t } = useTypedTranslations();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError(t.auth.fieldRequired);
      return;
    }
    
    if (!password.trim()) {
      setError(t.auth.fieldRequired);
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push(getLocalizedPath('/', locale));
      router.refresh();
    } catch (error: any) {
      setError(error.message || t.errors.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpPath = getLocalizedPath('/auth/signup', locale);
  const homePath = getLocalizedPath('/', locale);
  const forgotPasswordPath = getLocalizedPath('/auth/forgot-password', locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={homePath} className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-3xl text-gray-900">{t.header.title}</span>
          </Link>
          <p className="mt-2 text-gray-600">{t.header.subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.auth.signInTitle}</CardTitle>
            <CardDescription>
              {t.auth.signInDescription}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href={forgotPasswordPath} className="text-sm text-blue-600 hover:text-blue-800">
                  {locale === 'ja' ? 'パスワードを忘れた方' : 'Forgot Password?'}
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? t.auth.signInLoading : t.auth.signInButton}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                {t.auth.noAccount}{' '}
                <Link href={signUpPath} className="text-blue-600 hover:text-blue-800 font-medium">
                  {t.auth.signUpLink}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
