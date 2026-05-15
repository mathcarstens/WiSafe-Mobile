import { RiskLevel, SecurityType, SignalLabel } from "@/src/types/wifi";

export function getSecurityType(capabilities: string): SecurityType {
  const value = capabilities?.toUpperCase() ?? "";

  if (!value || value === "[ESS]") return "OPEN";
  if (value.includes("WEP")) return "WEP";
  if (value.includes("WPA3")) return "WPA3";
  if (value.includes("WPA2") || value.includes("RSN")) return "WPA2";
  if (value.includes("WPA")) return "WPA";

  return "UNKNOWN";
}

export function classifyRisk(securityType: SecurityType): RiskLevel {
  if (securityType === "OPEN") return "HIGH";
  if (securityType === "WEP") return "MEDIUM";
  if (securityType === "WPA") return "MEDIUM";
  if (securityType === "WPA2") return "SAFE";
  if (securityType === "WPA3") return "SAFE";

  return "MEDIUM";
}

export function getSignalLabel(level: number): SignalLabel {
  if (level >= -60) return "Forte";
  if (level >= -75) return "Medio";

  return "Fraco";
}

export function getSecurityLabel(securityType: SecurityType) {
  if (securityType === "OPEN") return "Aberta";
  if (securityType === "UNKNOWN") return "Desconhecida";

  return securityType;
}

export function getRiskLabel(riskLevel: RiskLevel) {
  if (riskLevel === "SAFE") return "Seguro";
  if (riskLevel === "MEDIUM") return "Medio risco";

  return "Alto risco";
}

export function getRiskColor(riskLevel: RiskLevel) {
  if (riskLevel === "SAFE") return "#2e7d32";
  if (riskLevel === "MEDIUM") return "#b7791f";

  return "#c62828";
}

export function getSecurityWarning(riskLevel: RiskLevel) {
  if (riskLevel === "HIGH") {
    return "Esta rede nao e segura. Seus dados podem ser interceptados. Evite acessar contas, bancos ou informacoes pessoais.";
  }

  if (riskLevel === "MEDIUM") {
    return "Esta rede possui seguranca limitada. Evite acessar dados sensiveis.";
  }

  return "Esta rede usa criptografia forte. Ainda assim, conecte-se apenas a redes que voce reconhece.";
}
