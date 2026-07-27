// Money as "Rs 2,400" (PKR, no decimals for whole amounts).
export function money(amount) {
  const n = Number(amount || 0);
  return `Rs ${n.toLocaleString('en-PK', { maximumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;
}
