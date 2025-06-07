'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, MessageCircle, Heart, UserPlus, AtSign, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getLocalizedNotificationsClient, markNotificationAsReadClient, markAllNotificationsAsReadClient, getUnreadNotificationCountClient } from '@/lib/api/notifications-client';
import { SupportedLanguage } from '@/lib/i18n';
import { Notification } from '@/lib/types/notification';
import { formatRelativeTime } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useTypedTranslations, useLocalizedNavigation } from '@/lib/i18n/useTranslations';

interface NotificationPopoverProps {
  userId: string;
}

export function NotificationPopover({ userId }: NotificationPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTypedTranslations();
  const { getLocalizedHref } = useLocalizedNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine current locale from pathname
  const currentLocale = pathname?.startsWith('/ja') ? 'ja' : 'en';

  useEffect(() => {
    if (userId && userId !== 'undefined') {
      loadNotifications();
      loadUnreadCount();
      // ポーリングで通知をチェック
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // 30秒ごと
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    // ポップオーバーを開いた時にも通知を再読み込み
    if (isOpen && userId && userId !== 'undefined') {
      loadNotifications();
    }
  }, [isOpen, userId]);

  const loadNotifications = async () => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid userId for notifications:', userId);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getLocalizedNotificationsClient(userId, currentLocale as SupportedLanguage);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid userId for unread count:', userId);
      return;
    }
    
    try {
      const count = await getUnreadNotificationCountClient(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 既読にする
    if (!notification.is_read) {
      await markNotificationAsReadClient(notification.id.toString());
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // ナビゲーション
    if (notification.related_product_id) {
      router.push(getLocalizedHref(`/products/${notification.related_product_id}`));
      setIsOpen(false);
    } else if (notification.related_user_slug) {
      router.push(getLocalizedHref(`/profiles/${notification.related_user_slug}`));
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadClient(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Function to localize notification text
  const getLocalizedNotificationText = (notification: Notification) => {
    const { type, title, message } = notification;
    
    // Use translation keys based on the original Japanese titles
    if (title === 'あなたのプロダクトが投票されました') {
      return {
        title: t.notifications.voteNotificationTitle,
        message: currentLocale === 'en' 
          ? message.replace(/さんが/, ' voted for ').replace(/に投票しました/, '')
          : message
      };
    } else if (title === 'あなたのプロダクトにコメントがありました') {
      return {
        title: t.notifications.commentNotificationTitle,
        message: currentLocale === 'en'
          ? message.replace(/さんが/, ' commented on ').replace(/にコメントしました/, '')
          : message
      };
    } else if (title === 'あなたのコメントに返信がありました') {
      return {
        title: t.notifications.replyNotificationTitle,
        message: currentLocale === 'en'
          ? message.replace(/さんがあなたのコメントに返信しました/, ' replied to your comment')
          : message
      };
    }
    
    // Return original text if no translation is needed or available
    return { title, message };
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'vote':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-indigo-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-gray-500" />;
      case 'collection':
        return <Heart className="w-4 h-4 text-purple-500" />;
      case 'featured':
        return <Heart className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">{t.notifications.title}</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              {t.notifications.markAllRead}
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              {t.actions.loading}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t.notifications.noNotifications}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const localizedText = getLocalizedNotificationText(notification);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {localizedText.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {localizedText.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.created_at, currentLocale)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
