'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) {
    return null; // Don't show anything when online and never was offline
  }

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg",
        isOnline
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      )}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Connexion rétablie</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Mode hors ligne</span>
          </>
        )}
      </div>
    </div>
  );
}
