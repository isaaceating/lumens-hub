import type { ReactNode } from "react";
import BuilderEditorHeader from "./BuilderEditorHeader";

type BuilderEditorShellProps = {
  programId: string;
  eyebrow: string;
  title: string;
  description: string;
  sidebar: ReactNode;
  children: ReactNode;
};

export default function BuilderEditorShell({
  programId,
  eyebrow,
  title,
  description,
  sidebar,
  children,
}: BuilderEditorShellProps) {
  return (
    <div className="space-y-6 pb-10">
      <BuilderEditorHeader
        programId={programId}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {sidebar}
        {children}
      </section>
    </div>
  );
}
