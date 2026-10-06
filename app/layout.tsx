import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "আজকের আলো | বাংলা সংবাদ",
  description: "সত্যের পথে, মানুষের পাশে — আজকের আলো বাংলা সংবাদপত্র।",
  metadataBase: new URL("https://ajker-alo.vercel.app"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;
}
