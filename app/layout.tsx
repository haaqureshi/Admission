import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";

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
  },
  twitter: {
    title: 'Blackstone Board',
    description: 'Admission management system for Blackstone School of Law',
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
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}