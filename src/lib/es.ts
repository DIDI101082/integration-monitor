export function buildDateRange(
  desde: string | null | undefined,
  hasta: string | null | undefined
): Record<string, string> {
  if (desde && hasta) {
    return {
      gte: desde,
      lte: hasta,
      format: "yyyy-MM-dd",
      time_zone: "America/Argentina/Buenos_Aires",
    };
  }
  return { gte: "now-24h", lte: "now" };
}
