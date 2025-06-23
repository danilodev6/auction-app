import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: es,
  });
}
