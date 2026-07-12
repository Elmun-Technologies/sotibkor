import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getMessages } from "@/i18n";
import { SupabaseSessionSync } from "@/components/auth/SupabaseSessionSync";

// FOUC yo'q: paint'dan oldin localStorage 'theme' -> <html data-theme>.
// Tanlov bo'lmasa data-theme qo'yilmaydi — CSS system afzalligini ishlatadi.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const t = getMessages();

export const metadata: Metadata = {
  title: `${t.app.name} — ${t.app.tagline}`,
  description: t.app.comingSoonDesc,
  openGraph: {
    title: `${t.app.name} — ${t.app.tagline}`,
    description: t.app.comingSoonDesc,
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${t.app.name} — ${t.app.tagline}`,
    description: t.app.comingSoonDesc,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0e",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseSessionSync />
        {children}
      </body>
    </html>
  );
}
