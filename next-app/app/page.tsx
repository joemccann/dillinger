import nextDynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/ui/Skeleton";

// Force dynamic rendering to prevent SSR context issues
export const dynamic = "force-dynamic";

// Import the entire editor as a client-only component
const Editor = nextDynamic(
  () => import("@/components/editor/EditorContainer").then((mod) => mod.EditorContainer),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export default function Page() {
  return <Editor />;
}
