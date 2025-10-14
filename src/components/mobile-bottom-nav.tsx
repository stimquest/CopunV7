
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  menuItems: MenuItem[];
}

export function MobileBottomNav({ menuItems }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex justify-around items-center z-50 pb-safe-bottom">
      {menuItems.map((item) => {
        const isActive = (item.href === '/dashboard' && pathname === item.href) || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const IconComponent = item.icon;
        return (
          <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center text-center w-full h-full">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-full h-full',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

    