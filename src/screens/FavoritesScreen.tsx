import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import { MainNavigationBar } from "@/src/components/MainNavigationBar";
import { NetworkCard } from "@/src/components/NetworkCard";
import { getFavoriteNetworks, toggleFavoriteNetwork, } from "@/src/storage/favoritesStorage";
import { WifiNetwork } from "@/src/types/wifi";

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<WifiNetwork[]>([]);

  const loadFavorites = useCallback(async () => {
    const saved = await getFavoriteNetworks();
    setFavorites(saved.map((network) => ({ ...network, isFavorite: true })));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  async function handleToggleFavorite(network: WifiNetwork) {
    await toggleFavoriteNetwork(network);
    loadFavorites();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />
      <MainNavigationBar active="favorites" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ gap: 4, marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1f2937" }}>
            Favoritos
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b" }}>
            Redes marcadas pelo usuario ficam salvas localmente.
          </Text>
        </View>

        {favorites.map((network) => (
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

        {favorites.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
            <Text style={{ color: "#64748b", textAlign: "center" }}>
              Nenhuma rede favoritada ainda.
            </Text>
            <Button mode="contained" icon="wifi" onPress={() => router.push("/home")}>
              Ver redes
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
