"use client";

import { useEffect, useState } from "react";
import { getMessages } from "@/i18n";
import { IconButton } from "./IconButton";

type Theme = "light" | "dark";

const t = getMessages();

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") {
      setTheme(attr);
      return;
    }
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage mavjud emas — e'tiborsiz */
    }
    setTheme(next);
  };

  const label = theme === "light" ? t.nav.themeDark : t.nav.themeLight;

  return (
    <IconButton
      bordered
      onClick={toggle}
      aria-label={t.nav.theme}
      title={label}
    >
      <span aria-hidden className="text-base leading-none">
        {theme === "light" ? "☾" : "☀"}
      </span>
    </IconButton>
  );
}
