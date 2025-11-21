

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import GameDisplayPage from '../[gameId]/page';

export default function ValidationPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col gap-4 justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement du quiz...</p>
        </div>
    }>
      <GameDisplayPage />
    </Suspense>
  );
}

    