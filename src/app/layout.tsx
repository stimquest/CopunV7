
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { ConnectionStatus } from '@/components/connection-status';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: "Cop'un de la mer",
  description: 'Outil pédagogique environnemental pour les sports de plein air',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Cop'un de la mer",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: "Cop'un de la mer",
    title: "Cop'un de la mer",
    description: 'Outil pédagogique environnemental pour les sports de plein air',
  },
  twitter: {
    card: 'summary',
    title: "Cop'un de la mer",
    description: 'Outil pédagogique environnemental pour les sports de plein air',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <ConnectionStatus />
          <PWAInstallPrompt />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
