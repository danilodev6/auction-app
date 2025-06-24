export function formatSimpleDate(dateInput: string | Date): string {
  const date = new Date(dateInput);

  return date.toLocaleDateString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
