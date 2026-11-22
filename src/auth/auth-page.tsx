"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Wordmark } from "@/components/wordmark";
import { withReturnPath } from "./return-path";
import { useReturnPath } from "./use-return-path";

type AuthPageProps = {
  title: string;
  footer: { text: string; linkLabel: string; href: string };
  children: ReactNode;
};

export function AuthPage({ title, footer, children }: AuthPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-16">
      <div className="self-center">
        <Wordmark />
      </div>
      <div className="panel flex flex-col gap-6 p-6 shadow-md sm:p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {children}
      </div>
      <p className="text-center text-sm text-muted-foreground">
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
    <Link href={href} className="text-link font-medium text-foreground">
      {label}
    </Link>
  );
}
