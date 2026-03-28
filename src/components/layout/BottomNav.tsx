'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Layers, PlusCircle, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Browse', href: '/browse', icon: Layers },
    { name: 'Post', href: '/post', icon: PlusCircle },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-[#0A1628]/95 backdrop-blur-md border-t border-gray-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-[#34D1BF]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
