# Lessons tab refactor wiring plan

Current status:

- `LessonEditorForm.tsx` is ready for the left-side lesson form.
- `LessonListPanel.tsx` is ready for the right-side lesson list wrapper.
- `LessonsPanel.tsx` renders the lesson cards.
- `LessonSummaryCard.tsx` renders each lesson card.
- `LessonActionLinks.tsx` renders Edit / Materials / Quiz actions.
- `LessonsTabLayout.tsx` combines the form and list into the final Lessons tab layout.

Next wiring target:

`src/app/admin/training/[programId]/builder/page.tsx`

Replace only the body of `renderLessonsPanel` with `LessonsTabLayout`.

Required import:

```tsx
import LessonsTabLayout from "./components/LessonsTabLayout";
```

Expected usage:

```tsx
const renderLessonsPanel = () => (
  <LessonsTabLayout
    programId={programId}
    sections={sections}
    courses={sortedCourses}
    lessons={lessons}
    loading={loadingLessons}
    editingId={editingLessonId}
    saving={savingLesson}
    message={lessonMessage}
    form={lessonForm}
    statuses={statusOptions}
    onChange={handleLessonChange}
    onSubmit={handleLessonSave}
    onCancel={resetLessonForm}
    onRefresh={fetchLessons}
    onEdit={startEditLesson}
  />
);
```

After wiring, remove the template DOM bridge for Materials / Quiz only after Vercel confirms the React buttons work.
