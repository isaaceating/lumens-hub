import type { TrainingCourse, TrainingLesson, TrainingLevel } from "@/lib/training";

export const getSectionTitle = (sections: TrainingLevel[], levelId?: string) => {
  if (!levelId) return "Unassigned";
  return sections.find((section) => section.id === levelId)?.title || "Unknown section";
};

export const getSectionOrder = (sections: TrainingLevel[], levelId?: string) => {
  if (!levelId) return Number.MAX_SAFE_INTEGER;
  return sections.find((section) => section.id === levelId)?.order ?? Number.MAX_SAFE_INTEGER - 1;
};

export const getCourse = (courses: TrainingCourse[], courseId?: string) =>
  courses.find((course) => course.id === courseId);

export const getCourseTitle = (courses: TrainingCourse[], courseId?: string) =>
  getCourse(courses, courseId)?.title || "Unknown course";

export const getCourseOrder = (courses: TrainingCourse[], courseId?: string) =>
  getCourse(courses, courseId)?.order ?? Number.MAX_SAFE_INTEGER;

export const getCourseSectionId = (courses: TrainingCourse[], courseId?: string) =>
  getCourse(courses, courseId)?.levelId || "";

export const sortLessonsByHierarchy = (
  lessons: TrainingLesson[],
  courses: TrainingCourse[],
  sections: TrainingLevel[]
) =>
  [...lessons].sort((a, b) => {
    const sectionOrderDiff =
      getSectionOrder(sections, getCourseSectionId(courses, a.courseId)) -
      getSectionOrder(sections, getCourseSectionId(courses, b.courseId));
    if (sectionOrderDiff !== 0) return sectionOrderDiff;

    const courseOrderDiff = getCourseOrder(courses, a.courseId) - getCourseOrder(courses, b.courseId);
    if (courseOrderDiff !== 0) return courseOrderDiff;

    const lessonOrderDiff = (a.order || 0) - (b.order || 0);
    if (lessonOrderDiff !== 0) return lessonOrderDiff;

    return (a.title || "").localeCompare(b.title || "");
  });
