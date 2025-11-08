"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

export function useRouter() {
  const router = useNextRouter();
  const [isPending, startTransition] = useTransition();

  const push = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  const replace = useCallback(
    (href: string) => {
      startTransition(() => {
        router.replace(href);
      });
    },
    [router]
  );

  const back = useCallback(() => {
    startTransition(() => {
      router.back();
    });
  }, [router]);

  return {
    ...router,
    push,
    replace,
    back,
    isPending,
  };
}
