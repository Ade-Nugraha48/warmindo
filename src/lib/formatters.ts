/**
 * Utility formatters for Warmindo CRM
 */

/**
 * Normalizes Indonesian phone number to standard format (08xxx or 62xxx)
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+62")) {
    cleaned = "62" + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Masks phone number for privacy: e.g. 081234567890 -> 0812****7890 or 62812****7890
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "-";
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.length < 8) {
    return cleaned;
  }
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Formats ISO date string into Indonesian readable format (e.g. 16 Nov 2026, 21:30)
 */
export function formatIndonesianDate(dateString: string | null | undefined): string {
  if (!dateString) return "Belum ada transaksi";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Format tanggal invalid";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Formats number to Rupiah string (e.g. Rp 15.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates direct wa.me link with normalized Indonesian phone and encoded text
 */
export function formatWaUrl(phone: string, message: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
