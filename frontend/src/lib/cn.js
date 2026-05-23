/** Merge class names; falsy values are omitted. */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
