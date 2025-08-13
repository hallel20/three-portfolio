import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hallel Ojowuro - 3D Portfolio',
  description: 'Interactive 3D portfolio showcasing full-stack development projects and skills',
  keywords: 'developer, portfolio, 3D, React, Next.js, TypeScript, full-stack',
  authors: [{ name: 'Hallel Ojowuro' }],
  openGraph: {
    title: 'Hallel Ojowuro - 3D Portfolio',
    description: 'Interactive 3D portfolio showcasing full-stack development projects',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}