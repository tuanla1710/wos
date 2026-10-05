"use client";

import { useEffect } from "react";

export function useReloadOnChange(load: () => void | Promise<void>) {
  useEffect(() => {
    const onChange = () => {
      void Promise.resolve(load()).catch(() => {});
    };
    window.addEventListener("workos:changed", onChange);
    return () => window.removeEventListener("workos:changed", onChange);
  }, [load]);
}
