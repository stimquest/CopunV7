'use client';

import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { AlertCircle, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (!isOnline) {
    return (
      <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-yellow-50 border-yellow-200 z-50">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Mode hors ligne</strong> - Vous êtes actuellement hors ligne. Les données en cache sont disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  if (showReconnected) {
    return (
      <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-50 border-green-200 z-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Connexion rétablie</strong> - Vos données sont en cours de synchronisation.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

