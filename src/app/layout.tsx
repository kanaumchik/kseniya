import type { Metadata } from "next";
import { Marck_Script, Great_Vibes } from "next/font/google";
import { Suspense } from "react";
import { ScrollUnlockOnNavigation } from "@/components/ScrollUnlockOnNavigation";
import "./globals.css";

const marckScript = Marck_Script({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-marck",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Ксения Наумчик | Автор",
  description: "Автор трансформационных программ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${marckScript.variable} ${greatVibes.variable}`}>
      <body>
        <Suspense fallback={null}>
          <ScrollUnlockOnNavigation />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
