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
import { getNotificationsClient, markNotificationAsReadClient, markAllNotificationsAsReadClient, getUnreadNotificationCountClient } from '@/lib/api/notifications-client';
import { Notification } from '@/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface NotificationPopoverProps {
  userId: string;
}

export function NotificationPopover({ userId }: NotificationPopoverProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadNotifications = async () => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid userId for notifications:', userId);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getNotificationsClient(userId);
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
    if (!notification.read) {
      await markNotificationAsReadClient(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // ナビゲーション
    if (notification.data?.product_id) {
      router.push(`/products/${notification.data.product_id}`);
      setIsOpen(false);
    } else if (notification.data?.user_id) {
      router.push(`/profiles/${notification.data.user_id}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadClient(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upvote':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-gray-500" />;
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
          <h4 className="font-semibold">通知</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              すべて既読
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              読み込み中...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              通知はありません
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
