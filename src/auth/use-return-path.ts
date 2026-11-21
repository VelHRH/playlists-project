"use client";

import { useSearchParams } from "next/navigation";
import { safeReturnPath } from "./return-path";

export function useReturnPath() {
  return safeReturnPath(useSearchParams().get("next"));
}
