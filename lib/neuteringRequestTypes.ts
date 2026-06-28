// Shared labels for neutering_requests, matching the database check
// constraints.
export const URGENCY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const TRANSPORT_LABELS: Record<string, string> = {
  yes: "Tenho transporte",
  no: "Não tenho transporte",
  need_help: "Preciso de ajuda com transporte",
};
