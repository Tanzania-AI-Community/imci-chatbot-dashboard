"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 text-center">
      <div className="space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <div className="text-9xl font-extrabold tracking-tighter text-primary">
              404
            </div>
            <div className="absolute -right-6 -top-1 rotate-12 rounded-md bg-destructive px-2 py-1 text-sm font-medium text-destructive-foreground">
              Page not found
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Oops! You seem to be lost in the IMCI flow
          </h1>

          <p className="max-w-md text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved to
            another URL.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            size="lg"
            className="group w-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>

          <Button size="lg" className="group w-full" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 size-4 transition-transform group-hover:scale-110" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          <p>
            Need help? Contact your system administrator at{" "}
            <a
              href="mailto:tech@ai.or.tz"
              className="text-primary hover:underline"
            >
              tech@ai.or.tz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
