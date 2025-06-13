"use client";

import Link from "next/link";
import { footerConfig } from "@/config/site";

interface DashboardFooterProps {
  className?: string;
}

export function DashboardFooter({ className }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();
  const copyright = footerConfig.copyright.replace(
    /\d{4}/,
    currentYear.toString()
  );

  return (
    <footer
      className={`mt-auto w-full border-t border-border bg-muted/40 px-4 py-3 text-sm ${className}`}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{footerConfig.title}</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              {footerConfig.version}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {footerConfig.description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-end">
          <div className="flex items-center gap-4">
            {footerConfig.links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {link.title}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
