import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { PermissionsAndroid, Platform, ScrollView, View } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import { MainNavigationBar } from "@/src/components/MainNavigationBar";
import { NetworkCard } from "@/src/components/NetworkCard";
import { scanWifiNetworks } from "@/src/services/wifiService";
import { getFavoriteNetworks, toggleFavoriteNetwork } from "@/src/storage/favoritesStorage";
import { getStoredUser } from "@/src/storage/userStorage";
import { StoredUser, WifiNetwork } from "@/src/types/wifi";

async function requestWifiPermissions() {
  const location = await Location.requestForegroundPermissionsAsync();

  if (location.status !== "granted") {
    throw new Error(
      "Para listar redes proximas, o app precisa de permissao de localizacao e acesso a Wi-Fi.",
    );
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const nearbyWifiPermission = (
      PermissionsAndroid.PERMISSIONS as Record<string, string | undefined>
    ).NEARBY_WIFI_DEVICES;

    if (nearbyWifiPermission) {
      const permission =
        nearbyWifiPermission as Parameters<typeof PermissionsAndroid.request>[0];
      const result = await PermissionsAndroid.request(permission);

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissao de Wi-Fi proximo negada.");
      }
    }
  }
}

export default function NetworksScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const loadNetworks = useCallback(async (forceRefresh = false) => {
    setLoading(true);

    try {
      await requestWifiPermissions();
      const favorites = await getFavoriteNetworks();
      const favoriteIds = new Set(favorites.map((network) => network.bssid));
      const scanned = await scanWifiNetworks(forceRefresh);

      setNetworks(
        scanned.map((network) => ({
          ...network,
          isFavorite: favoriteIds.has(network.bssid),
        })),
      );

      if (forceRefresh) {
        setSnackMessage("Redes atualizadas.");
        setSnackVisible(true);
      }
    } catch (error) {
      setSnackMessage(
        error instanceof Error ? error.message : "Erro ao buscar redes Wi-Fi.",
      );
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getStoredUser().then(setUser);
      loadNetworks(false);
    }, [loadNetworks]),
  );

  async function handleToggleFavorite(network: WifiNetwork) {
    await toggleFavoriteNetwork(network);
    setNetworks((current) =>
      current.map((item) =>
        item.bssid === network.bssid
          ? { ...item, isFavorite: !item.isFavorite }
          : item,
      ),
    );
  }

  function handleNetworkPress(network: WifiNetwork) {
    router.push({
      pathname: "/network-details",
      params: { bssid: network.bssid },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <MainNavigationBar
        active="scan"
        loadingScan={loading}
        onScanPress={() => loadNetworks(true)}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ gap: 4, marginBottom: 4 }}>
          <Text style={{ fontSize: 15, color: "#475569" }}>
            Bem-vindo{user?.nome ? `, ${user.nome}` : ""}.
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1f2937" }}>
            Redes disponiveis
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b" }}>
            Toque em Escanear para atualizar as redes proximas.
          </Text>
        </View>

        {networks.map((network) => (
          <NetworkCard
            key={network.bssid}
            network={network}
            onPress={handleNetworkPress}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}

        {!loading && networks.length === 0 && (
          <Text style={{ textAlign: "center", color: "#64748b", marginTop: 30 }}>
            Nenhuma rede encontrada.
          </Text>
        )}
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}
