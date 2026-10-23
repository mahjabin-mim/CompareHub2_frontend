import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AccountEffects } from '@/components/auth/AccountEffects';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';

// Launch screens for iPhones added to the home screen; without them iOS flashes white on open.
const iphoneSplashSizes = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3],
  [375, 812, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2], [320, 568, 2]
] as const;

export const metadata: Metadata = {
  title: 'CompareHub',
  description: "Compare skincare prices across Bangladesh's top online stores.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/icons/apple-touch-icon.png'
  },
  appleWebApp: {
    capable: true,
    title: 'CompareHub',
    statusBarStyle: 'default',
    startupImage: iphoneSplashSizes.map(([width, height, ratio]) => ({
      url: `/splash/${width}x${height}@${ratio}x.png`,
      media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`
    }))
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF0E6'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppNavbar />
          <AccountEffects />
          {children}
          <InstallPrompt />
        </Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
