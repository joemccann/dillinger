"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-bg-highlight",
        className
      )}
    />
  );
}

export function EditorSkeleton() {
  return (
    <div className="h-dvh flex overflow-hidden bg-bg-primary">
      {/* Sidebar skeleton */}
      <aside className="w-sidebar bg-bg-sidebar h-dvh flex flex-col p-4">
        {/* Logo */}
        <Skeleton className="h-8 w-32 mb-6" />

        {/* Nav sections */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="ml-2 space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Bottom buttons */}
        <div className="mt-auto space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar skeleton */}
        <div className="h-12 bg-bg-navbar flex items-center px-4 gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <div className="flex-1" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>

        {/* Document title skeleton */}
        <div className="h-12 bg-border-light flex items-center px-4">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Editor/preview area */}
        <div className="flex-1 flex">
          {/* Editor pane */}
          <div className="w-1/2 border-r border-border-light p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Preview pane */}
          <div className="w-1/2 p-4 space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </main>
    </div>
  );
}
