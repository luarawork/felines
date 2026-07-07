// Shared labels for neutering_requests, matching the database check
// constraints. Labels live in lib/i18n/pt.ts and lib/i18n/en.ts under
// `urgency` and `transport`.
export function getUrgencyLabel(value: string, t: (key: string) => string): string {
  return t(`urgency.${value}`);
}

export function getTransportLabel(value: string, t: (key: string) => string): string {
  return t(`transport.${value}`);
}
