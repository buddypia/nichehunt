'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SubmitModal } from '@/components/SubmitModal';
import { usePathname } from 'next/navigation';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

const inter = Inter({ subsets: ['latin'] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch();

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  // ホームページでのみ検索機能を有効にする
  const showSearch = pathname === '/' || pathname === '/products' || pathname === '/trending';

  return (
    <>
      <Header
        onSubmitClick={handleSubmitClick}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        selectedCategory={showSearch ? selectedCategory : undefined}
        onCategoryFilter={showSearch ? setSelectedCategory : undefined}
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SearchProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </SearchProvider>
      </body>
    </html>
  );
}
