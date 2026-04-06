import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Dillinger - Online Markdown Editor",
  description:
    "Cloud-enabled, mobile-ready, offline-storage-compatible Markdown editor with live preview and cloud sync.",
};

export const dynamic = "force-dynamic";

const Editor = nextDynamic(
  () => import("@/components/editor/EditorContainer").then((mod) => mod.EditorContainer),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export default function Page() {
  return (
    <>
      <h1 className="sr-only">
        Dillinger - Free Online Markdown Editor for Developers and AI Workflows
      </h1>
      <Editor />
    </>
  );
}
