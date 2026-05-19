export type SecurityType = "OPEN" | "WEP" | "WPA" | "WPA2" | "WPA3" | "UNKNOWN";

export type RiskLevel = "SAFE" | "MEDIUM" | "HIGH";

export type SignalLabel = "Fraco" | "Medio" | "Forte";

export type WifiNetwork = {
  ssid: string;
  bssid: string;
  level: number;
  frequency: number;
  capabilities: string;
  securityType: SecurityType;
  riskLevel: RiskLevel;
  signalLabel: SignalLabel;
  isFavorite: boolean;
};

export type StoredUser = {
  nome?: string;
  email: string;
  telefone?: string;
  rememberMe: boolean;
};
