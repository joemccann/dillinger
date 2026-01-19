import nextDynamic from "next/dynamic";

// Force dynamic rendering to prevent SSR context issues
export const dynamic = "force-dynamic";

// Import the entire editor as a client-only component
const Editor = nextDynamic(
  () => import("@/components/editor/EditorContainer").then((mod) => mod.EditorContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted">Loading...</div>
      </div>
    ),
  }
);

export default function Page() {
  return <Editor />;
}
