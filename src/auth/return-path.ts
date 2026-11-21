import type { Route } from "next";

const base = "http://localhost";

export function safeReturnPath(next: string | null): Route {
  if (!next?.startsWith("/")) return "/";
  const url = new URL(next, base);
  if (url.origin !== base) return "/";
  return `${url.pathname}${url.search}` as Route;
}

export function withReturnPath(href: string, returnPath: string) {
  return returnPath === "/" ? href : `${href}?next=${encodeURIComponent(returnPath)}`;
}

export function signInReturningTo(returnPath: string) {
  return withReturnPath("/sign-in", returnPath);
}
