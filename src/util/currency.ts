export function formatToDollar(price: number) {
  return `${Math.round(price).toLocaleString("de-DE")}`;
}
