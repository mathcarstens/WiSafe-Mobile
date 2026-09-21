import { NativeModules, Platform } from "react-native";
import { WifiNetwork } from "@/src/types/wifi";
import { classifyRisk, getSecurityType, getSignalLabel } from "@/src/services/wifiRules";

type NativeWifiNetwork = {
  SSID?: string;
  ssid?: string;
  BSSID?: string;
  bssid?: string;
  level?: number;
  frequency?: number;
  capabilities?: string;
};

declare const require: (name: string) => any;

let lastScannedNetworks: WifiNetwork[] = [];

const mockNetworks: WifiNetwork[] = [
  createWifiNetwork({
    ssid: "Casa_Heloisa",
    bssid: "38:7a:0e:10:44:21",
    level: -48,
    frequency: 5180,
    capabilities: "[WPA2-PSK-CCMP][ESS]",
  }),
  createWifiNetwork({
    ssid: "Cafe_Clientes",
    bssid: "a4:2b:b0:91:11:8c",
    level: -68,
    frequency: 2412,
    capabilities: "[WPA-PSK-TKIP][WEP][ESS]",
  }),
  createWifiNetwork({
    ssid: "Free_Public",
    bssid: "00:18:39:88:1b:70",
    level: -54,
    frequency: 2462,
    capabilities: "[ESS]",
  }),
  createWifiNetwork({
    ssid: "Faculdade_Segura",
    bssid: "bc:33:ac:9f:22:10",
    level: -77,
    frequency: 5745,
    capabilities: "[WPA3-SAE-CCMP][ESS]",
  }),
];

function createWifiNetwork(raw: {
  ssid: string;
  bssid: string;
  level: number;
  frequency: number;
  capabilities: string;
}): WifiNetwork {
  const securityType = getSecurityType(raw.capabilities);

  return {
    ...raw,
    securityType,
    riskLevel: classifyRisk(securityType),
    signalLabel: getSignalLabel(raw.level),
    isFavorite: false,
  };
}

function mapNativeNetwork(network: NativeWifiNetwork, index: number): WifiNetwork {
  return createWifiNetwork({
    ssid: network.SSID || network.ssid || "Rede sem nome",
    bssid: network.BSSID || network.bssid || `unknown-${index}`,
    level: typeof network.level === "number" ? network.level : -80,
    frequency: typeof network.frequency === "number" ? network.frequency : 0,
    capabilities: network.capabilities ?? "",
  });
}

async function scanWithWifiReborn() {
  try {
    const WifiManager = require("react-native-wifi-reborn").default;

    if (!WifiManager?.loadWifiList) return null;

    const networks = (await WifiManager.loadWifiList()) as NativeWifiNetwork[];
    return networks.map(mapNativeNetwork);
  } catch {
    return null;
  }
}

export async function scanWifiNetworks(forceRefresh = false): Promise<WifiNetwork[]> {
  if (Platform.OS !== "android") {
    lastScannedNetworks = mockNetworks;
    return mockNetworks;
  }

  const nativeScanner = NativeModules.WifiScanner;

  if (nativeScanner?.scanWifiNetworks) {
    const networks = (await nativeScanner.scanWifiNetworks(forceRefresh)) as NativeWifiNetwork[];
    lastScannedNetworks = networks.map(mapNativeNetwork);
    return lastScannedNetworks;
  }

  const wifiRebornNetworks = await scanWithWifiReborn();

  if (wifiRebornNetworks?.length) {
    lastScannedNetworks = wifiRebornNetworks;
    return wifiRebornNetworks;
  }

  lastScannedNetworks = mockNetworks;
  return mockNetworks;
}

export async function findWifiNetwork(bssid: string) {
  const cached = lastScannedNetworks.find((network) => network.bssid === bssid);

  if (cached) return cached;

  const networks = await scanWifiNetworks();
  return networks.find((network) => network.bssid === bssid) ?? null;
}

export async function connectToWifiNetwork(network: WifiNetwork, password?: string) {
  if (Platform.OS !== "android") {
    throw new Error("Conexao Wi-Fi pelo app esta disponivel apenas no Android.");
  }

  const nativeScanner = NativeModules.WifiScanner;

  if (!nativeScanner?.connectToNetwork) {
    throw new Error("Modulo nativo de conexao Wi-Fi nao esta disponivel. Rode o app pelo Android nativo.");
  }

  return nativeScanner.connectToNetwork(
    network.ssid,
    network.securityType,
    password ?? "",
  ) as Promise<string>;
}
