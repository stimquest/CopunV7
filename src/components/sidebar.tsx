
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
    ChevronLeft,
    FileText,
    PencilRuler,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { UserMenu } from '@/components/user-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface NavLink {
    href: string;
    label: string;
    icon: React.ElementType;
}

const adminNavLinks: NavLink[] = [
    { href: "/admin/contenu", label: "Contenu Pédagogique", icon: FileText },
    { href: "/admin/game-cards", label: "Cartes de Jeu", icon: PencilRuler },
];

interface SidebarProps {
    menuItems: NavLink[];
}

export function Sidebar({ menuItems }: SidebarProps) {
    const pathname = usePathname();
    const isMounted = useMounted();

    const { value: isExpanded, setValue: setIsExpanded } = useLocalStorage('sidebar-expanded', true);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };
    
    if (!isMounted) {
        return <aside className="relative hidden h-screen bg-background border-r transition-all duration-300 md:flex flex-col w-20"></aside>; 
    }

    return (
        <aside className={cn(
            "hidden h-screen bg-sidebar-background border-r-sidebar-border transition-all duration-300 ease-in-out md:flex flex-col sticky top-0",
            isExpanded ? "w-64" : "w-20"
        )}>
            <div className={cn("flex h-16 items-center border-b border-sidebar-border px-6", isExpanded ? 'justify-start' : 'justify-center')}>
                 <Link href="/" className="flex items-center font-semibold">
                    <Image src="/assets/logoCopun1.png" alt="Logo" width={96} height={96} />
                </Link>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                <TooltipProvider delayDuration={0}>
                    <SidebarNavLinks title="Menu" links={menuItems} isExpanded={isExpanded} pathname={pathname} />
                    <Separator className="my-4 bg-sidebar-border" />
                    <SidebarNavLinks title="Admin" links={adminNavLinks} isExpanded={isExpanded} pathname={pathname} />
                </TooltipProvider>
            </nav>

            <div className="mt-auto border-t border-sidebar-border">
                <div className={cn("flex items-center justify-between", isExpanded ? "p-2" : "p-1")}>
                    {isExpanded ? (
                        <UserMenu />
                    ) : (
                        <div className="flex justify-center w-full py-2">
                            <UserMenu />
                        </div>
                    )}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={toggleSidebar}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                    <ChevronLeft className={cn("h-4 w-4 transition-transform", !isExpanded && "rotate-180")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {isExpanded ? "Réduire" : "Agrandir"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </aside>
    );
}

interface SidebarNavLinksProps {
    title: string;
    links: NavLink[];
    isExpanded: boolean;
    pathname: string;
}

function SidebarNavLinks({ title, links, isExpanded, pathname }: SidebarNavLinksProps) {
     return (
        <div>
            {isExpanded && (
                <h3 className="px-3 py-2 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">{title}</h3>
            )}
             {links
                .filter(link => link.href !== "/modules")
                .map(link => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                            <Link href={link.href} className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:text-sidebar-primary hover:bg-sidebar-accent",
                                isActive && "bg-sidebar-accent text-sidebar-primary font-semibold",
                                !isExpanded && "justify-center"
                            )}>
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className={cn(!isExpanded && "sr-only")}>{link.label}</span>
                            </Link>
                        </TooltipTrigger>
                        {!isExpanded && <TooltipContent side="right">{link.label}</TooltipContent>}
                    </Tooltip>
                );
            })}
        </div>
    );
}
