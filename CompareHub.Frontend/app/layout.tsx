import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppNavbar } from '@/components/navigation/AppNavbar';

export const metadata: Metadata = {
  title: 'CompareHub',
  description: 'Personalized product comparison platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
