"use client";

import Link from "next/link";
import { FileText, ListChecks, Pencil } from "lucide-react";

type LessonActionLinksProps = {
  programId: string;
  lessonId: string;
  onEdit: () => void;
};

export default function LessonActionLinks({ programId, lessonId, onEdit }: LessonActionLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
      >
        <Pencil size={15} /> Edit
      </button>
      <Link
        href={`/admin/training/${programId}/builder/materials?lessonId=${lessonId}`}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        <FileText size={15} /> Materials
      </Link>
      <Link
        href={`/admin/training/${programId}/builder/quiz?lessonId=${lessonId}`}
        className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
      >
        <ListChecks size={15} /> Quiz
      </Link>
    </div>
  );
}
