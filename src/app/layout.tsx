import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'M Diet — Intelligent Calorie, Nutrition & Weight Intelligence',
  description:
    'An AI-powered calorie, nutrition, hydration, weight-management, and activity-tracking web application crafted with Apple-level simplicity.',
  keywords: ['M Diet', 'nutrition tracker', 'calorie counter', 'AI food scanner', 'Apple Health', 'fitness tracking'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f5f7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥗</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
