import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Class Verse',
  description: 'Compliance-first training operations platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
