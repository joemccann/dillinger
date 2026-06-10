"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface UserMenuProps {
  name: string;
  image?: string | null;
}

export function UserMenu({ name, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {image ? (
          <img src={image} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-plum flex items-center justify-center text-xs font-bold text-bg-sidebar">
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-bg-navbar rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in z-modal">
          <div className="px-4 py-2 text-xs text-text-muted border-b border-border-settings">
            {name}
          </div>
          <Link
            href="/settings/api"
            className="block px-4 py-2 text-sm text-text-invert hover:bg-bg-highlight"
            onClick={() => setOpen(false)}
          >
            API Keys
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-text-invert hover:bg-bg-highlight"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
