'use client';

import { usePathname } from 'next/navigation';
import { Bell, X } from 'lucide-react';
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

  const fetchNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user_notifications JOINED with notifications
    const { data, error } = await supabase
      .from('user_notifications')
      .select(`
        read,
        notifications ( id, message, type, created_at )
      `)
      .eq('user_id', user.id)
      // Supabase JS doesn't support order on joined tables well without a view, so we'll sort in JS
      .limit(30);

    if (error) {
      console.error('Fetch notifs error:', error);
      return;
    }

    if (data) {
      const formatted: Notification[] = data.map((d: any) => ({
        id: d.notifications?.id || Math.random().toString(),
        message: d.notifications?.message || '',
        time: new Date(d.notifications?.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: d.read,
        type: d.notifications?.type as 'new_quest' | 'accepted' | 'completed',
        _created_at: new Date(d.notifications?.created_at || Date.now()).getTime(),
      })).sort((a, b) => b._created_at - a._created_at);

      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    // Subscribe to new user_notifications
    const channel = supabase
      .channel('user_notifs_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
      }, () => {
        // Just refetch when a new notification drops
        fetchNotifications();
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

  const markAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Update DB
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    }
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
