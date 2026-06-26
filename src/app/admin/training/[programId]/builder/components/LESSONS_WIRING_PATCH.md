# Lessons wiring patch

`builder/page.tsx` is still a large single file. GitHub connector updates require replacing the full file, so the safer path is to wire this manually in VS Code.

## 1. Add import

In:

```txt
src/app/admin/training/[programId]/builder/page.tsx
```

Add near the other imports:

```tsx
import LessonsTabLayout from "./components/LessonsTabLayout";
```

## 2. Replace `renderLessonsPanel`

Find:

```tsx
const renderLessonsPanel = () => (
  <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
    ...old lesson form and old lesson list...
  </section>
);
```

Replace the whole function with:

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

## 3. Keep `template.tsx` bridge temporarily

Do not remove `builder/template.tsx` yet.

After this wiring, both the old DOM bridge and the React buttons may appear temporarily. Confirm the React buttons work first, then remove the DOM bridge in a later cleanup commit.

## 4. Test checklist

```bash
npm run build
```

Then test:

- `/admin/training/{programId}/builder`
- Lessons tab Add / Edit Lesson
- Lessons tab Materials button
- Lessons tab Quiz button
- `/builder/materials?lessonId=...`
- `/builder/quiz?lessonId=...`
