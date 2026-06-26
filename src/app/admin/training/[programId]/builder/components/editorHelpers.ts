export const sortByOrder = <T extends { order?: number; title?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || "").localeCompare(b.title || "");
  });
