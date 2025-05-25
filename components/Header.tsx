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
import { Plus, User, Settings, LogOut, Trophy, Bookmark, Bell, Menu, X } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { AdvancedSearchBar } from '@/components/AdvancedSearchBar';
import { NotificationPopover } from '@/components/NotificationPopover';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onSubmitClick: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: string;
  onCategoryFilter?: (category: string) => void;
}

export function Header({ 
  onSubmitClick,
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategoryFilter 
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      console.log('Current user loaded:', user);
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
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    if (currentUser?.id) {
      router.push(`/profile?id=${currentUser.id}`);
    }
  };

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/products', label: 'プロダクト' },
    { href: '/trending', label: 'トレンド' },
    { href: '/categories', label: 'カテゴリー' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">NicheHunt</span>
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
          {onSearchChange && (
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <AdvancedSearchBar 
                value={searchQuery} 
                onChange={onSearchChange}
                onCategoryFilter={onCategoryFilter}
                selectedCategory={selectedCategory}
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* 通知ボタン */}
            {currentUser && (
              <NotificationPopover userId={currentUser.id} />
            )}

            {/* 投稿ボタン */}
            <Button 
              onClick={onSubmitClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              投稿する
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
                    <span>プロフィール</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/saved')} className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>保存したモデル</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>設定</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
              >
                ログイン
              </Button>
            )}

            {/* モバイルメニューボタン */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* モバイル検索バー */}
                  {onSearchChange && (
                    <div className="px-4">
                      <AdvancedSearchBar 
                        value={searchQuery} 
                        onChange={onSearchChange}
                        onCategoryFilter={onCategoryFilter}
                        selectedCategory={selectedCategory}
                      />
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
                        <Link href="/saved" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Bookmark className="mr-2 h-4 w-4" />
                            保存したモデル
                          </Button>
                        </Link>
                        <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            設定
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}

                  <Separator />
                  
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
                        ログアウト
                      </Button>
                    </div>
                  ) : (
                    <div className="px-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push('/auth/signin');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        ログイン
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
