import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blackstone Board',
  description: 'Admission management system for Blackstone School of Law',
  metadataBase: new URL('https://admission.blackstoneboard.com'),
  openGraph: {
    title: 'Blackstone Board',
    description: 'Admission management system for Blackstone School of Law',
    url: 'https://admission.blackstoneboard.com',
    siteName: 'Blackstone Board',
    images: [
      {
        url: 'https://admission.blackstoneboard.com/bsol-logo.webp',
        width: 800,
        height: 600,
        alt: 'Blackstone Board Logo',
        type: 'image/webp',
      },
      {
        url: 'https://admission.blackstoneboard.com/bsol-logo.avif',
        width: 800,
        height: 600,
        alt: 'Blackstone Board Logo',
        type: 'image/avif',
      },
    ],
  },
  twitter: {
    title: 'Blackstone Board',
    description: 'Admission management system for Blackstone School of Law',
    images: ['https://admission.blackstoneboard.com/bsol-logo.webp'],
  },
  alternates: {
    canonical: 'https://admission.blackstoneboard.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}