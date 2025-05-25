import { Suspense } from 'react';
import ProfileClient from './ProfileClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プロフィール - NicheHunt',
  description: 'ユーザープロフィール',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" />}>
      <ProfileClient />
    </Suspense>
  );
}
