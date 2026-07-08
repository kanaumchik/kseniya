import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ксения Наумчик | Автор трансформационных программ",
  description: "Локальный сайт записи на индивидуальную диагностику.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
