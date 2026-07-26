import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases de Tailwind resolviendo los conflictos (la última gana). */
export function cn(...clases) {
  return twMerge(clsx(clases));
}
