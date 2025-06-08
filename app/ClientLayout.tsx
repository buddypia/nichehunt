'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SubmitModal } from '@/components/SubmitModal';
import { usePathname, useRouter } from 'next/navigation';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  useEffect(() => {
    // Check for authentication refresh cookie
    const checkAuthRefresh = () => {
      const cookies = document.cookie.split(';');
      const refreshCookie = cookies.find(cookie => cookie.trim().startsWith('sb-refresh='));
      
      if (refreshCookie) {
        // Remove the cookie
        document.cookie = 'sb-refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // Refresh the page to update authentication state
        router.refresh();
      }
    };

    checkAuthRefresh();
    
    // Check periodically for auth refresh
    const interval = setInterval(checkAuthRefresh, 1000);
    
    return () => clearInterval(interval);
  }, [router]);

  // ホームページでのみ検索機能を有効にする
  // const showSearch = pathname === '/' || pathname === '/products'; // This logic is now handled within Header for rendering AdvancedSearchBar

  return (
    <>
      <Header
        onSubmitClick={handleSubmitClick}
        // searchQuery={showSearch ? searchQuery : undefined} // Removed
        // onSearchChange={showSearch ? setSearchQuery : undefined} // Removed
        // selectedCategory={showSearch ? selectedCategory : undefined} // Removed
        // onCategoryFilter={showSearch ? setSelectedCategory : undefined} // Removed
      />
      <main>
        {children}
      </main>
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SearchProvider>
  );
}
