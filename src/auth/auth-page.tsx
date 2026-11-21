"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { withReturnPath } from "./return-path";
import { useReturnPath } from "./use-return-path";

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
        <Suspense fallback={<FooterLink href={footer.href} label={footer.linkLabel} />}>
          <ReturningFooterLink href={footer.href} label={footer.linkLabel} />
        </Suspense>
      </p>
    </main>
  );
}

function ReturningFooterLink({ href, label }: { href: string; label: string }) {
  return <FooterLink href={withReturnPath(href, useReturnPath())} label={label} />;
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="font-medium text-foreground underline">
      {label}
    </Link>
  );
}
