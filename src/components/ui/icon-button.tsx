"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Button, buttonVariants } from "./button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "aria-label"> & { label: string };

export function IconButton({ label, variant = "ghost", size = "icon-sm", children, ...props }: IconButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button variant={variant} size={size} aria-label={label} {...props} />}>
        {children}
      </Tooltip.Trigger>
      <TooltipPopup label={label} />
    </Tooltip.Root>
  );
}

type IconLinkProps = { label: string; href: ComponentProps<typeof Link>["href"]; children: ReactNode };

export function IconLink({ label, href, children }: IconLinkProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<Link href={href} aria-label={label} className={buttonVariants({ variant: "ghost", size: "icon" })} />}
      >
        {children}
      </Tooltip.Trigger>
      <TooltipPopup label={label} />
    </Tooltip.Root>
  );
}

function TooltipPopup({ label }: { label: string }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={6} className="z-50">
        <Tooltip.Popup className="origin-(--transform-origin) rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md transition-[opacity,scale] duration-(--duration-fast) ease-(--ease-out-soft) data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {label}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  );
}
