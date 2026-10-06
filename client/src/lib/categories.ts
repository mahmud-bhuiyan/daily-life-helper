import type { Category } from "../types";

/** Keep in sync with `server/src/constants/category.ts`. */
export const CATEGORY_NAME_MAX_LENGTH = 20;

export const categoryNameError = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "Category name is required";
  if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
    return `Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`;
  }
  return null;
};

export const splitCategoriesByScope = (categories: Category[]) => ({
  global: categories.filter((c) => c.scope === "global"),
  user: categories.filter((c) => c.scope === "user"),
});
