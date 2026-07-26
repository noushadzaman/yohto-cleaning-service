"use client";

import dynamic from "next/dynamic";

/** Quill (~150KB+) — only downloaded when a dialog mounts this component. */
export const RichTextEditorLazy = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-24 animate-pulse rounded-lg border border-border bg-muted"
        aria-hidden
      />
    ),
  }
);
