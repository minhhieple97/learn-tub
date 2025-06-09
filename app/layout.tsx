import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactQueryProvider } from '@/components/shared/react-query';
import NextTopLoader from 'nextjs-toploader';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnTub - YouTube Learning Platform',
  description:
    'Transform your YouTube watching into active learning with AI-powered notes and insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <NextTopLoader showSpinner={false} />
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
