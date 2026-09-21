import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import { Button, Chip, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import {
  getRiskColor,
  getRiskLabel,
  getSecurityLabel,
  getSecurityWarning,
} from "@/src/services/wifiRules";
import { connectToWifiNetwork, findWifiNetwork } from "@/src/services/wifiService";
import {
  isFavoriteNetwork,
  removeFavoriteNetwork,
  saveFavoriteNetwork,
} from "@/src/storage/favoritesStorage";
import { WifiNetwork } from "@/src/types/wifi";

type WarningStep = "question" | "risk";

export default function NetworkDetailsScreen() {
  const router = useRouter();
  const { bssid } = useLocalSearchParams<{ bssid: string }>();
  const [network, setNetwork] = useState<WifiNetwork | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [warningStep, setWarningStep] = useState<WarningStep | null>(null);
  const [wifiPassword, setWifiPassword] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function loadNetwork() {
      if (!bssid) return;

      const found = await findWifiNetwork(bssid);
      if (!found) return;

      const isFavorite = await isFavoriteNetwork(found.bssid);
      setNetwork({ ...found, isFavorite });
    }

    loadNetwork();
  }, [bssid]);

  async function handleToggleFavorite() {
    if (!network) return;

    if (network.isFavorite) {
      await removeFavoriteNetwork(network.bssid);
      setNetwork({ ...network, isFavorite: false });
      setSnackMessage("Rede removida dos favoritos.");
    } else {
      await saveFavoriteNetwork(network);
      setNetwork({ ...network, isFavorite: true });
      setSnackMessage("Rede marcada como confiavel.");
    }

    setSnackVisible(true);
  }

  function closeConnectionDialogs() {
    setPasswordModalVisible(false);
    setWarningStep(null);
    setWifiPassword("");
  }

  async function requestConnection(password?: string) {
    if (!network) return;

    setConnecting(true);

    try {
      await connectToWifiNetwork(network, password);
      closeConnectionDialogs();
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

  function continueToConnection() {
    if (!network) return;

    if (network.securityType === "WEP") {
      setSnackMessage("Redes WEP usam protecao antiga e nao sao suportadas para conexao pelo app.");
      setSnackVisible(true);
      setWarningStep(null);
      return;
    }

    if (network.securityType === "OPEN") {
      requestConnection();
      return;
    }

    setPasswordModalVisible(true);
  }

  function handleConnectPress() {
    if (!network) return;

    if (network.riskLevel === "SAFE") {
      continueToConnection();
      return;
    }

    setWarningStep("question");
  }

  if (!network) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
        <AppHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#64748b", textAlign: "center" }}>
            Carregando dados da rede...
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Voltar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const riskColor = getRiskColor(network.riskLevel);
  const riskLabel = getRiskLabel(network.riskLevel).toLowerCase();
  const securityLabel = getSecurityLabel(network.securityType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 18,
            borderWidth: 1,
            borderColor: "#dbe3ef",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}>
            {network.ssid}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip icon="lock" textStyle={{ color: riskColor }}>
              {securityLabel}
            </Chip>
            <Chip icon="shield-alert" textStyle={{ color: riskColor }}>
              {getRiskLabel(network.riskLevel)}
            </Chip>
            <Chip icon="wifi">{network.signalLabel}</Chip>
          </View>

          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={{ color: "#475569" }}>BSSID: {network.bssid}</Text>
            <Text style={{ color: "#475569" }}>Frequencia: {network.frequency || "N/D"} MHz</Text>
            <Text style={{ color: "#475569" }}>RSSI: {network.level} dBm</Text>
            <Text style={{ color: "#475569" }}>Capabilities: {network.capabilities || "[ESS]"}</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 16,
            borderLeftWidth: 5,
            borderLeftColor: riskColor,
            borderWidth: 1,
            borderColor: "#dbe3ef",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1f2937" }}>
            Aviso de seguranca
          </Text>
          <Text style={{ color: "#475569", marginTop: 6, lineHeight: 20 }}>
            {getSecurityWarning(network.riskLevel)}
          </Text>
        </View>

        <Button
          mode="contained"
          icon="wifi"
          loading={connecting}
          disabled={connecting}
          onPress={handleConnectPress}
          style={{ borderRadius: 8, backgroundColor: "#15803d" }}
        >
          Conectar pelo app
        </Button>

        <Button
          mode={network.isFavorite ? "outlined" : "contained"}
          icon={network.isFavorite ? "star-off" : "star"}
          onPress={handleToggleFavorite}
          style={{ borderRadius: 8, backgroundColor: network.isFavorite ? undefined : "#1a3a6b" }}
          textColor={network.isFavorite ? "#1a3a6b" : "#ffffff"}
        >
          {network.isFavorite ? "Remover dos favoritos" : "Marcar como confiavel"}
        </Button>

        <Button mode="text" icon="arrow-left" onPress={() => router.back()}>
          Voltar
        </Button>
      </ScrollView>

      <Modal
        visible={warningStep !== null}
        transparent
        animationType="fade"
        onRequestClose={closeConnectionDialogs}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 18, gap: 14 }}>
            {warningStep === "question" ? (
              <>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
                  Deseja conectar nessa rede?
                </Text>
                <Text style={{ color: "#475569", lineHeight: 20 }}>
                  {network.ssid} e uma rede {securityLabel.toLowerCase()} com {riskLabel}.
                  Antes de continuar, revise os riscos dessa conexao.
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    mode="outlined"
                    onPress={closeConnectionDialogs}
                    style={{ flex: 1, borderRadius: 8 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => setWarningStep("risk")}
                    style={{ flex: 1, borderRadius: 8, backgroundColor: riskColor }}
                  >
                    Continuar
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
                  Riscos da rede
                </Text>
                <Text style={{ color: "#475569", lineHeight: 20 }}>
                  {getSecurityWarning(network.riskLevel)}
                </Text>
                <Text style={{ color: "#475569", lineHeight: 20 }}>
                  Evite acessar bancos, contas pessoais ou enviar dados sensiveis nessa conexao.
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    mode="outlined"
                    onPress={closeConnectionDialogs}
                    style={{ flex: 1, borderRadius: 8 }}
                    disabled={connecting}
                  >
                    Nao conectar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={continueToConnection}
                    loading={connecting}
                    disabled={connecting}
                    style={{ flex: 1, borderRadius: 8, backgroundColor: riskColor }}
                  >
                    Entendi
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
          <View style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 18, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>
              Senha da rede
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20 }}>
              Informe a senha de {network.ssid}. Depois o Android vai pedir a confirmacao da conexao.
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
                onPress={() => requestConnection(wifiPassword)}
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
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}
