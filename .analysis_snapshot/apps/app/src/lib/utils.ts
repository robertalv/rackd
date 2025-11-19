export function getInitials(name: string | undefined) {
  if (!name) return "U";
  return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
}

export function formatDate(dateValue?: string | number | null): string {
  if (!dateValue) return "Unknown"
  try {
    const date = typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(dateValue)
  }
}