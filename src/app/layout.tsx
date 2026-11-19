import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Плейлисти",
  description: "Створюйте списки треків і діліться ними з друзями",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={cn("h-full antialiased font-sans", inter.variable)}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
