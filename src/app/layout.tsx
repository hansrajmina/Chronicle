import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Chronicle AI',
  description: 'An AI-assisted writing tool for the modern writer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/aos@next/dist/aos.js" async></script>
        <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
