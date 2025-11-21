
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import {
    Calendar,
    Eye,
    Gamepad2,
    User,
    Trophy,
    Lightbulb
} from 'lucide-react';

const menuItems = [
    { href: "/stages", label: "Stages", icon: Calendar },
    { href: "/observations", label: "Observations", icon: Eye },
    { href: "/jeux", label: "Jeux", icon: Gamepad2 },
    { href: "/classement", label: "Classement", icon: Trophy },
    { href: "/profil", label: "Profil", icon: User },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="flex min-h-screen w-full bg-muted/40 safe-area-inset">
      {!isHomePage && <Sidebar menuItems={menuItems}/>}
      <div className={`flex flex-col flex-1 ${isHomePage ? 'w-full' : ''}`}>
        <main className={`flex-1 p-4 md:p-6 lg:p-8 ${isHomePage ? 'pb-8' : 'pb-20 md:pb-8'} pt-safe-top md:pt-4`}>
            {children}
        </main>
        {!isHomePage && <MobileBottomNav menuItems={menuItems} />}
      </div>
    </div>
  );
}
