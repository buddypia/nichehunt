'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SubmitModal } from '@/components/SubmitModal';
import { usePathname } from 'next/navigation';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  // const pathname = usePathname(); // No longer directly needed here for Header props
  // const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch(); // No longer directly needed here for Header props

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

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
