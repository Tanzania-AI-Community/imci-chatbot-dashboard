"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768; // Define breakpoint for mobile devices

export function useIsMobile() {
  // Initialize with null to avoid hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Add resize handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return false during SSR
  return isMobile ?? false;
}
