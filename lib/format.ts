export function formatCurrencyVnd(vnd: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(vnd))}đ`;
}

export function formatArea(m2: number): string {
  return `${m2}m²`;
}
