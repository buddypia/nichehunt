'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, User, Settings, LogOut, Bookmark, Menu } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUser, signOut } from '@/lib/auth';
import { AdvancedSearchBar } from '@/components/AdvancedSearchBar';
import { NotificationPopover } from '@/components/NotificationPopover';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@/contexts/SearchContext';
import { useTypedTranslations, useLocalizedNavigation } from '@/lib/i18n/useTranslations';

interface HeaderProps {
  onSubmitClick: () => void;
  // searchQuery?: string; // To be removed
  // onSearchChange?: (value: string) => void; // To be removed
}

export function Header({ 
  onSubmitClick,
  // searchQuery = '', // To be removed
  // onSearchChange // To be removed
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery } = useSearch();
  const { t } = useTypedTranslations();
  const { getLocalizedHref } = useLocalizedNavigation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Effect to handle navigation when searchQuery changes and user is not on /products
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '' && pathname !== '/products') {
      // Check if the search bar is intended to be active on the current page,
      // Show search bar on most pages except auth and edit pages
      const isSearchActivePage = !pathname.includes('/auth/') && !pathname.includes('/edit');
      if (isSearchActivePage) { // Only navigate if search was initiated from an active search page
         router.push(getLocalizedHref('/products'));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pathname, router]); // router was missing, pathname is needed

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      router.push(getLocalizedHref('/'));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    router.push(getLocalizedHref(`/profiles/${currentUser.slug}`));
  };

  const navItems = [
    { href: getLocalizedHref('/'), label: t.nav.home },
    { href: getLocalizedHref('/products'), label: t.nav.products },
    { href: getLocalizedHref('/about'), label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href={getLocalizedHref('/')} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image 
                  src="/logo.png"
                  alt="NicheNext Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              
              <div className="flex flex-col">
                <span className="font-extrabold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  NicheNext
                </span>
                <span className="text-[10px] font-medium text-gray-500 -mt-1 tracking-wider">
                  {t.header.subtitle.toUpperCase()}
                </span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium transition-all text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 検索バー */}
          {/* Conditionally render AdvancedSearchBar based on whether search is active for the page */}
          {/* Show search bar on most pages except auth and edit pages */}
          {!pathname.includes('/auth/') && !pathname.includes('/edit') && (
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <AdvancedSearchBar />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* 言語切り替え */}
            <LanguageSwitcher />

            {/* 通知ボタン */}
            {currentUser && (
              <NotificationPopover userId={currentUser.id} />
            )}

            {/* 投稿ボタン（デスクトップのみ表示） */}
            <Button 
              onClick={onSubmitClick}
              className="hidden md:flex bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.header.submitProduct}
            </Button>

            {/* ユーザーメニュー */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar_url} alt={currentUser.username} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {currentUser.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.nav.profile}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getLocalizedHref('/saved'))} className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>{t.nav.saved}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getLocalizedHref('/settings'))} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t.nav.settings}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.nav.signOut}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push(getLocalizedHref('/auth/signin'))}
                className="hidden md:block"
              >
                {t.nav.signIn}
              </Button>
            )}

            {/* モバイルメニューボタン */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80" onOpenAutoFocus={(e) => { e.preventDefault(); }}>
                <VisuallyHidden>
                  <SheetTitle>Product search menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Menu for searching products
                  </SheetDescription>
                </VisuallyHidden>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* モバイル検索バー */}
                  {!pathname.includes('/auth/') && !pathname.includes('/edit') && (
                    <div className="px-4">
                      <AdvancedSearchBar />
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2 px-4">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-gray-900"
                          >
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>

                  {currentUser && (
                    <>
                      <Separator />
                      <div className="px-4 space-y-2">
                        <Link href={getLocalizedHref('/saved')} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Bookmark className="mr-2 h-4 w-4" />
                            {t.nav.saved}
                          </Button>
                        </Link>
                        <Link href={getLocalizedHref('/settings')} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            {t.nav.settings}
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* 言語切り替え（モバイル） */}
                  <div className="px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{t.nav.home === 'Home' ? 'Language' : '言語設定'}</span>
                      <LanguageSwitcher />
                    </div>
                  </div>

                  <Separator />

                  {/* 投稿ボタン（モバイル） */}
                  <div className="px-4">
                    <Button
                      onClick={() => {
                        onSubmitClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t.header.submitProduct}
                    </Button>
                  </div>
                  
                  {currentUser ? (
                    <div className="px-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t.nav.signOut}
                      </Button>
                    </div>
                  ) : (
                    <div className="px-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push(getLocalizedHref('/auth/signin'));
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {t.nav.signIn}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
