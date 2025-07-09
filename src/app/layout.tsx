
import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/app/components/game-provider';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'HEGGIE: Hegg Interstellar Exchange',
  description: 'A space trading game.',
  openGraph: {
    title: 'HEGGIE: Hegg Interstellar Exchange',
    description: 'A space trading game where you build and manage your own intergalactic enterprise.',
    url: 'https://heggiegame.netlify.app/',
    siteName: 'HEGGIE',
    images: [
      {
        url: 'https://heggiegame.netlify.app/images/blueprints/sclassBlueprint.png',
        width: 956,
        height: 669,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="icon" href="/images/favicon/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning>
          <GameProvider>
            {children}
          </GameProvider>
      </body>
    </html>
  );
}
