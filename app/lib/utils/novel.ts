/** Replace underscores with spaces in a novel name. */
export function sanitizeNovelName(name: string): string {
  return name.replace(/_/g, " ");
}
