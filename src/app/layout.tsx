import type { Metadata } from "next";
import { Golos_Text, JetBrains_Mono, Literata } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Плейлисти",
  description: "Створюйте списки треків і діліться ними з друзями",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={cn("h-full antialiased font-sans", golos.variable, literata.variable, jetbrains.variable)}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
