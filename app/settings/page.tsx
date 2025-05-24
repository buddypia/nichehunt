import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: '設定 - NicheHunt',
  description: 'アカウント設定とプロフィール管理',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
