/**
 * Combines CSS class names dynamically.
 * Works similarly to clsx / classnames, tailored for Tailwind CSS utility applications.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean | undefined | null | string | number })[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  // Deduplicate simple Tailwind classes if needed (rudimentary check, sufficient for MVP)
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number as Indian Rupees (INR) currency.
 * e.g., 15000000 -> ₹1.5 Cr, 7500000 -> ₹75 Lakh
 */
export function formatINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
