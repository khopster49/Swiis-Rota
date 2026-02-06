"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function ThemeInitializer() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
