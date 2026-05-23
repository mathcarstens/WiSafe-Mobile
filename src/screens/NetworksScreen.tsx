import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, PermissionsAndroid, Platform, ScrollView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import { MainNavigationBar } from "@/src/components/MainNavigationBar";
import { NetworkCard } from "@/src/components/NetworkCard";
import { getFavoriteNetworks, toggleFavoriteNetwork } from "@/src/storage/favoritesStorage";
import { connectToWifiNetwork, scanWifiNetworks } from "@/src/services/wifiService";
import { WifiNetwork } from "@/src/types/wifi";
import { getRiskColor, getRiskLabel, getSecurityLabel } from "@/src/services/wifiRules";

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
  const [selectedMediumNetwork, setSelectedMediumNetwork] = useState<WifiNetwork | null>(null);
  const [mediumWarningStep, setMediumWarningStep] = useState<"suspect" | "limited" | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [wifiPassword, setWifiPassword] = useState("");
  const [connecting, setConnecting] = useState(false);

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

  function handleNetworkPress(network: WifiNetwork) {
    if (network.riskLevel === "MEDIUM") {
      setSelectedMediumNetwork(network);
      setMediumWarningStep("suspect");
      return;
    }

    router.push({
      pathname: "/network-details",
      params: { bssid: network.bssid },
    });
  }

  function closeMediumWarning() {
    setSelectedMediumNetwork(null);
    setMediumWarningStep(null);
    setWifiPassword("");
    setPasswordModalVisible(false);
  }

  async function requestMediumConnection(password?: string) {
    if (!selectedMediumNetwork) return;

    setConnecting(true);

    try {
      await connectToWifiNetwork(selectedMediumNetwork, password);
      closeMediumWarning();
      setSnackMessage("Pedido de conexao enviado. Confirme na janela do Android.");
    } catch (error) {
      setSnackMessage(
        error instanceof Error ? error.message : "Nao foi possivel conectar nessa rede.",
      );
    } finally {
      setConnecting(false);
      setSnackVisible(true);
    }
  }

  function handleConfirmMediumConnection() {
    if (!selectedMediumNetwork) return;

    if (
      selectedMediumNetwork.securityType === "OPEN" ||
      selectedMediumNetwork.securityType === "WEP"
    ) {
      requestMediumConnection();
      return;
    }

    setPasswordModalVisible(true);
  }

  if (selectedMediumNetwork && mediumWarningStep) {
    const riskColor = getRiskColor(selectedMediumNetwork.riskLevel);
    const lockIcon =
      selectedMediumNetwork.securityType === "OPEN" ? "lock-open-variant" : "lock";

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
        <AppHeader />

        <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#dbe3ef",
              padding: 18,
              gap: 18,
              elevation: 2,
            }}
          >
            {mediumWarningStep === "suspect" ? (
              <>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1f2937",
                    textAlign: "center",
                  }}
                >
                  Wi-Fi
                </Text>

                <View
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: "#eef2ff",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons name="wifi" size={22} color="#1a3a6b" />
                    <MaterialCommunityIcons
                      name={lockIcon}
                      size={13}
                      color={riskColor}
                      style={{ position: "absolute", right: 7, bottom: 6 }}
                    />
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 16, fontWeight: "bold", color: "#1f2937" }}
                    >
                      {selectedMediumNetwork.ssid}
                    </Text>
                    <Text style={{ color: riskColor, fontSize: 13, marginTop: 2 }}>
                      {getSecurityLabel(selectedMediumNetwork.securityType)} -{" "}
                      {getRiskLabel(selectedMediumNetwork.riskLevel)}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: "#facc15",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#b7791f",
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={22}
                    color="#1f2937"
                  />
                  <Text style={{ flex: 1, color: "#111827", fontSize: 16, textAlign: "center" }}>
                    Essa rede e suspeita, deseja conectar?
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 20, justifyContent: "center" }}>
                  <Button
                    mode="outlined"
                    onPress={closeMediumWarning}
                    style={{ width: 104, borderRadius: 8 }}
                    disabled={connecting}
                  >
                    Nao
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => setMediumWarningStep("limited")}
                    style={{ width: 104, borderRadius: 8, backgroundColor: "#ef4444" }}
                    disabled={connecting}
                  >
                    Sim
                  </Button>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="alert"
                  size={86}
                  color="#facc15"
                  style={{ alignSelf: "center" }}
                />

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#dbe3ef",
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "bold",
                      color: "#111827",
                      textAlign: "center",
                    }}
                  >
                    Esta rede possui seguranca limitada.
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#111827",
                      textAlign: "center",
                    }}
                  >
                    Seus dados podem nao estar totalmente protegidos.
                  </Text>
                </View>

                <Text style={{ color: "#475569", fontSize: 12, textAlign: "center" }}>
                  Rede com protecao fraca. Evite acessar informacoes sensiveis.
                </Text>

                <Text
                  style={{
                    fontSize: 24,
                    color: "#111827",
                    textAlign: "center",
                    lineHeight: 30,
                  }}
                >
                  Deseja conectar mesmo assim?
                </Text>

                <View style={{ flexDirection: "row", gap: 20, justifyContent: "center" }}>
                  <Button
                    mode="outlined"
                    onPress={closeMediumWarning}
                    style={{ width: 104, borderRadius: 8 }}
                    disabled={connecting}
                  >
                    Nao
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleConfirmMediumConnection}
                    loading={connecting}
                    disabled={connecting}
                    style={{ width: 104, borderRadius: 8, backgroundColor: "#ef4444" }}
                  >
                    Sim
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>

        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 18,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>
                Senha da rede
              </Text>
              <Text style={{ color: "#64748b", lineHeight: 20 }}>
                Informe a senha de {selectedMediumNetwork.ssid}. Depois o Android vai pedir a
                confirmacao da conexao.
              </Text>
              <TextInput
                label="Senha do Wi-Fi"
                value={wifiPassword}
                onChangeText={setWifiPassword}
                mode="outlined"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button
                  mode="outlined"
                  onPress={() => setPasswordModalVisible(false)}
                  style={{ flex: 1, borderRadius: 8 }}
                  disabled={connecting}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => requestMediumConnection(wifiPassword)}
                  style={{ flex: 1, borderRadius: 8, backgroundColor: "#15803d" }}
                  loading={connecting}
                  disabled={connecting || wifiPassword.length < 8}
                >
                  Conectar
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={2500}
        >
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <MainNavigationBar
        active="scan"
        loadingScan={loading}
        onScanPress={loadNetworks}
      />

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
        duration={4500}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}
