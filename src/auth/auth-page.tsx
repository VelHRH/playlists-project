import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageProps = {
  title: string;
  footer: { text: string; linkLabel: string; href: string };
  children: ReactNode;
};

export function AuthPage({ title, footer, children }: AuthPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
      <p className="text-sm text-muted-foreground">
        {footer.text}{" "}
        <Link href={footer.href} className="font-medium text-foreground underline">
          {footer.linkLabel}
        </Link>
      </p>
    </main>
  );
}
