"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LinearProgress, Box, Fade, Backdrop, CircularProgress } from "@mui/material";

function LoadingBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);

  const onStart = useCallback(() => {
    setLoading(true);
    // Show backdrop only if loading takes more than 200ms
    const timer = setTimeout(() => {
      if (loading) {
        setShowBackdrop(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [loading]);

  const onComplete = useCallback(() => {
    setLoading(false);
    setShowBackdrop(false);
  }, []);

  useEffect(() => {
    // Hide loading bar when route changes complete
    onComplete();
  }, [pathname, searchParams, onComplete]);

  useEffect(() => {
    // Listen for link clicks to show loading
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.target) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        
        // Check if it's a different page (not just hash or same page)
        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          onStart();
        }
      }
    };

    // Listen for button clicks that might navigate
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      
      if (button && (button.type === "submit" || button.textContent?.includes("Batal"))) {
        return; // Don't show loading for cancel buttons
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("click", handleButtonClick);
    
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("click", handleButtonClick);
    };
  }, [onStart]);

  return (
    <>
      {/* Top loading bar */}
      <Fade in={loading} timeout={200}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        >
          <LinearProgress />
        </Box>
      </Fade>

      {/* Backdrop with spinner for longer loads */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9998,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
        open={showBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export function LoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBarContent />
    </Suspense>
  );
}
