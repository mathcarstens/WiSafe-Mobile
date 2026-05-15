import { WifiNetwork } from "@/src/types/wifi";
import { localStorageDriver } from "@/src/storage/localStorage";

export const FAVORITES_KEY = "@wisafe:favorites";

export async function getFavoriteNetworks(): Promise<WifiNetwork[]> {
  const data = await localStorageDriver.getItem(FAVORITES_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data) as WifiNetwork[];
  } catch {
    return [];
  }
}

export async function isFavoriteNetwork(bssid: string) {
  const favorites = await getFavoriteNetworks();
  return favorites.some((network) => network.bssid === bssid);
}

export async function saveFavoriteNetwork(network: WifiNetwork) {
  const favorites = await getFavoriteNetworks();
  const updated = favorites.some((item) => item.bssid === network.bssid)
    ? favorites
    : [...favorites, { ...network, isFavorite: true }];

  await localStorageDriver.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeFavoriteNetwork(bssid: string) {
  const favorites = await getFavoriteNetworks();
  const updated = favorites.filter((network) => network.bssid !== bssid);

  await localStorageDriver.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function toggleFavoriteNetwork(network: WifiNetwork) {
  const isFavorite = await isFavoriteNetwork(network.bssid);

  if (isFavorite) {
    return removeFavoriteNetwork(network.bssid);
  }

  return saveFavoriteNetwork(network);
}
