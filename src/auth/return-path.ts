"use client";

import type { Route } from "next";
import { useSearchParams } from "next/navigation";

const base = "http://localhost";

export function safeReturnPath(next: string | null): Route {
  if (!next?.startsWith("/")) return "/";
  const url = new URL(next, base);
  if (url.origin !== base) return "/";
  return `${url.pathname}${url.search}` as Route;
}

export function useReturnPath() {
  return safeReturnPath(useSearchParams().get("next"));
}

export function withReturnPath(href: string, returnPath: Route) {
  return returnPath === "/" ? href : `${href}?next=${encodeURIComponent(returnPath)}`;
}
