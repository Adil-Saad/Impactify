'use client';

import { usePathname } from 'next/navigation';
import { Bell, X, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'new_quest' | 'accepted' | 'completed';
}

export default function Header() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  let title = 'GoKind';
  if (pathname === '/browse') title = 'Discover';
  if (pathname === '/map') title = 'Kindness Pulse';
  if (pathname === '/post') title = 'Create Quest';
  if (pathname === '/profile') title = 'Profile';
  if (pathname === '/home') title = 'GoKind 🍃';

  // Listen for new quests via Supabase realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quests',
      }, (payload) => {
        const quest = payload.new as { title: string; category: string; id: string };
        const newNotification: Notification = {
          id: quest.id,
          message: `New quest posted: "${quest.title}"`,
          time: 'Just now',
          read: false,
          type: 'new_quest',
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 20));
        setUnreadCount(c => c + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quests',
      }, (payload) => {
        const quest = payload.new as { title: string; status: string; id: string };
        if (quest.status === 'active') {
          const notification: Notification = {
            id: `${quest.id}-accepted`,
            message: `Quest accepted: "${quest.title}"`,
            time: 'Just now',
            read: false,
            type: 'accepted',
          };
          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 w-full bg-[#0A1628]/90 backdrop-blur-md border-b border-gray-800 z-50 pt-safe">
      <div className="flex justify-between items-center h-14 px-4">
        <h1 className="text-xl font-bold text-white tracking-wide">{title}</h1>

        <div className="relative" ref={panelRef}>
          <button
            onClick={() => { setShowNotifications(v => !v); if (!showNotifications) markAllRead(); }}
            className="text-gray-300 hover:text-white transition-colors relative p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#34D1BF] text-[#0A1628] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0A1628]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[100]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-sm font-bold text-white">Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No notifications yet.</p>
                  <p className="text-xs mt-1">Post a quest to see updates here!</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0 ${!n.read ? 'bg-[#34D1BF]/5' : ''}`}
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        n.type === 'new_quest' ? 'bg-[#8B5CF6]' :
                        n.type === 'accepted' ? 'bg-[#34D1BF]' :
                        'bg-green-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
