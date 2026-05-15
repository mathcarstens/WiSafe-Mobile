import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { PermissionsAndroid, Platform, ScrollView, View } from "react-native";
import { Button, Snackbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import { NetworkCard } from "@/src/components/NetworkCard";
import { getFavoriteNetworks, toggleFavoriteNetwork } from "@/src/storage/favoritesStorage";
import { scanWifiNetworks } from "@/src/services/wifiService";
import { WifiNetwork } from "@/src/types/wifi";

async function requestWifiPermissions() {
  const location = await Location.requestForegroundPermissionsAsync();

  if (location.status !== "granted") {
    throw new Error(
      "Para listar redes proximas, o app precisa de permissao de localizacao e acesso a Wi-Fi. Isso e exigido pelo Android para proteger a privacidade do usuario.",
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
        throw new Error(
          "Permissao de Wi-Fi proximo negada. Ative a permissao nas configuracoes do Android.",
        );
      }
    }
  }
}

export default function NetworksScreen() {
  const router = useRouter();
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const loadNetworks = useCallback(async () => {
    setLoading(true);

    try {
      await requestWifiPermissions();
      const favorites = await getFavoriteNetworks();
      const favoriteIds = new Set(favorites.map((network) => network.bssid));
      const scanned = await scanWifiNetworks();

      setNetworks(
        scanned.map((network) => ({
          ...network,
          isFavorite: favoriteIds.has(network.bssid),
        })),
      );
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
      loadNetworks();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          padding: 12,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#dbe3ef",
        }}
      >
        <Button
          mode="contained"
          icon="wifi-sync"
          loading={loading}
          disabled={loading}
          onPress={loadNetworks}
          style={{ flex: 1, borderRadius: 8, backgroundColor: "#1a3a6b" }}
        >
          Escanear novamente
        </Button>
        <Button
          mode="outlined"
          icon="star"
          onPress={() => router.push("/favorites")}
          style={{ borderRadius: 8 }}
          textColor="#1a3a6b"
        >
          Favoritos
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ gap: 4, marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1f2937" }}>
            Redes disponiveis
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b" }}>
            A lista usa Wi-Fi real quando o modulo Android estiver disponivel e mock no Expo Go.
          </Text>
        </View>

        {networks.map((network) => (
          <NetworkCard
            key={network.bssid}
            network={network}
            onPress={(selected) =>
              router.push({
                pathname: "/network-details",
                params: { bssid: selected.bssid },
              })
            }
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
        duration={4500}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}
