
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page is no longer used and now simply redirects to the stages page,
// which serves as the new central hub.
export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/stages');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirection...</p>
        </div>
    );
}
