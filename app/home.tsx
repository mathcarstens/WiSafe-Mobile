import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Snackbar, Text } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WifiManager from "react-native-wifi-reborn";

type SegurancaTipo = "WPA2" | "WPA3" | "WEP" | "ABERTA";

interface RedeWifi {
  id: string;
  nome: string;
  seguranca: SegurancaTipo;
}

function detectarSeguranca(capabilities: string): SegurancaTipo {
  if (!capabilities) return "ABERTA";
  const c = capabilities.toUpperCase();
  if (c.includes("WPA3")) return "WPA3";
  if (c.includes("WPA2") || c.includes("RSN")) return "WPA2";
  if (c.includes("WEP")) return "WEP";
  return "ABERTA";
}

function getInfoSeguranca(seguranca: SegurancaTipo) {
  switch (seguranca) {
    case "WPA2":
      return {
        cadeado: "🔒",
        label: "Seguro - WPA2",
        cor: "#2e7d32",
        risco: "segura",
      };
    case "WPA3":
      return {
        cadeado: "🔒",
        label: "Seguro - WPA3",
        cor: "#2e7d32",
        risco: "segura",
      };
    case "WEP":
      return {
        cadeado: "🔓",
        label: "Médio Risco - WEP",
        cor: "#f59e0b",
        risco: "medio",
      };
    case "ABERTA":
      return {
        cadeado: "🔴",
        label: "Alto Risco - Aberta",
        cor: "#c62828",
        risco: "alto",
      };
  }
}

export default function Home() {
  const [wifiAtivado, setWifiAtivado] = useState(false);
  const [redes, setRedes] = useState<RedeWifi[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"home" | "conta" | "favoritos">(
    "home",
  );
  const [carregando, setCarregando] = useState(false);
  const [erroPermissao, setErroPermissao] = useState(false);

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalAviso, setModalAviso] = useState(false);
  const [redeSelecionada, setRedeSelecionada] = useState<RedeWifi | null>(null);

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  // ✅ Pede permissão de localização (necessário para escanear redes no Android)
  useEffect(() => {
    async function pedirPermissao() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErroPermissao(true);
        console.log("Permissão de localização negada");
      }
    }
    pedirPermissao();
  }, []);

  // ✅ Busca redes REAIS do celular
  async function handleToggleWifi(valor: boolean) {
    setWifiAtivado(valor);

    if (!valor) {
      setRedes([]);
      return;
    }

    if (erroPermissao) {
      setSnackMessage("Permissão de localização negada!");
      setSnackVisible(true);
      return;
    }

    try {
      setCarregando(true);
      const redesEncontradas = await WifiManager.loadWifiList();

      const redesMapeadas: RedeWifi[] = redesEncontradas.map((rede, index) => ({
        id: String(index),
        nome: rede.SSID || "Rede sem nome",
        seguranca: detectarSeguranca(rede.capabilities ?? ""),
      }));

      setRedes(redesMapeadas);
      console.log("Redes encontradas:", redesMapeadas.length);
    } catch (erro) {
      console.log("Erro ao buscar redes:", erro);
      setSnackMessage("Erro ao buscar redes Wi-Fi.");
      setSnackVisible(true);
    } finally {
      setCarregando(false);
    }
  }

  function handleClicarRede(rede: RedeWifi) {
    const info = getInfoSeguranca(rede.seguranca);
    setRedeSelecionada(rede);

    if (info.risco === "segura") {
      setSnackMessage("Conectado com sucesso!");
      setSnackVisible(true);
      console.log("Conectado em:", rede.nome);
    } else {
      setModalConfirmacao(true);
    }
  }

  function handleConfirmarConexao() {
    setModalConfirmacao(false);
    setTimeout(() => setModalAviso(true), 300);
  }

  function handleCancelarConexao() {
    setModalConfirmacao(false);
    setRedeSelecionada(null);
  }

  function handleConectarMesmoAssim() {
    setModalAviso(false);
    setSnackMessage("Conectado com sucesso!");
    setSnackVisible(true);
    console.log("Conectado em rede de risco:", redeSelecionada?.nome);
    setRedeSelecionada(null);
  }

  function handleCancelarAviso() {
    setModalAviso(false);
    setRedeSelecionada(null);
  }

  function handleFavoritar(id: string) {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  const redesExibidas =
    abaAtiva === "favoritos"
      ? redes.filter((r) => favoritos.includes(r.id))
      : redes;

  const infoRedeSelecionada = redeSelecionada
    ? getInfoSeguranca(redeSelecionada.seguranca)
    : null;

  return (
    <SafeAreaProvider style={{ backgroundColor: "#eeeeee" }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#1a2a4a",
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#2a5298",
              borderWidth: 2,
              borderColor: "#4a90d9",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </View>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold" }}>
            Wifi-Protect
          </Text>
        </View>

        {/* Abas */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
          }}
        >
          {(
            [
              { key: "home", icone: "🏠", label: "Home" },
              { key: "conta", icone: "👤", label: "Conta" },
              { key: "favoritos", icone: "🤍", label: "Favoritos" },
            ] as {
              key: "home" | "conta" | "favoritos";
              icone: string;
              label: string;
            }[]
          ).map((aba) => (
            <TouchableOpacity
              key={aba.key}
              onPress={() => setAbaAtiva(aba.key)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: abaAtiva === aba.key ? 2 : 0,
                borderBottomColor: "#1a2a4a",
              }}
            >
              <Text style={{ fontSize: 20 }}>{aba.icone}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: abaAtiva === aba.key ? "#1a2a4a" : "#888",
                  fontWeight: abaAtiva === aba.key ? "bold" : "normal",
                }}
              >
                {aba.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 15, marginBottom: 12, color: "#333" }}>
            Bem - Vindo Nome
          </Text>

          {/* Card Wi-Fi */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 12,
                color: "#222",
              }}
            >
              Wi-fi
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: wifiAtivado ? "#1565c0" : "#ddd",
                borderRadius: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: wifiAtivado ? "#f0f7ff" : "#fff",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: wifiAtivado ? "#1565c0" : "#333",
                }}
              >
                {carregando
                  ? "Buscando..."
                  : wifiAtivado
                    ? "Ativado"
                    : "Desativado"}
              </Text>
              <Switch
                value={wifiAtivado}
                onValueChange={handleToggleWifi}
                trackColor={{ false: "#ccc", true: "#1565c0" }}
                thumbColor={"#ffffff"}
              />
            </View>

            {/* Aviso permissão negada */}
            {erroPermissao && (
              <Text style={{ color: "#c62828", fontSize: 12, marginTop: 8 }}>
                ⚠️ Permissão de localização negada. Ative nas configurações do
                celular.
              </Text>
            )}

            {/* ✅ Lista de redes REAIS */}
            {redesExibidas.length > 0 && (
              <View style={{ marginTop: 12, gap: 10 }}>
                {redesExibidas.map((rede) => {
                  const info = getInfoSeguranca(rede.seguranca);
                  const isFavoritado = favoritos.includes(rede.id);

                  return (
                    <TouchableOpacity
                      key={rede.id}
                      onPress={() => handleClicarRede(rede)}
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 10,
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#e0e0e0",
                      }}
                    >
                      <View style={{ marginRight: 12, alignItems: "center" }}>
                        <Text style={{ fontSize: 22 }}>📶</Text>
                        <Text style={{ fontSize: 13 }}>{info.cadeado}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "bold",
                            color: "#222",
                          }}
                        >
                          {rede.nome}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: info.cor,
                            marginTop: 2,
                          }}
                        >
                          {info.label}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleFavoritar(rede.id)}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                            color: isFavoritado ? "#f59e0b" : "#ccc",
                          }}
                        >
                          {isFavoritado ? "⭐" : "☆"}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {abaAtiva === "favoritos" &&
              redesExibidas.length === 0 &&
              wifiAtivado && (
                <Text
                  style={{ textAlign: "center", color: "#888", marginTop: 16 }}
                >
                  Nenhuma rede favoritada ainda.
                </Text>
              )}
          </View>
        </ScrollView>

        {/* Modal Tela 2 — Rede suspeita */}
        <Modal
          visible={modalConfirmacao}
          transparent
          animationType="fade"
          onRequestClose={handleCancelarConexao}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                width: "88%",
                overflow: "hidden",
              }}
            >
              {redeSelecionada && infoRedeSelecionada && (
                <View
                  style={{
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                >
                  <View style={{ marginRight: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22 }}>📶</Text>
                    <Text style={{ fontSize: 13 }}>
                      {infoRedeSelecionada.cadeado}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: "#222",
                      }}
                    >
                      {redeSelecionada.nome}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: infoRedeSelecionada.cor,
                        marginTop: 2,
                      }}
                    >
                      {infoRedeSelecionada.label}
                    </Text>
                  </View>
                </View>
              )}

              <View
                style={{
                  backgroundColor: "#fbbf24",
                  margin: 16,
                  borderRadius: 8,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 18 }}>ℹ️</Text>
                <Text
                  style={{
                    flex: 1,
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    fontSize: 15,
                  }}
                >
                  Essa rede é suspeita,{"\n"}deseja conectar?
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                  justifyContent: "center",
                }}
              >
                <Button
                  mode="outlined"
                  onPress={handleCancelarConexao}
                  style={{ flex: 1, borderColor: "#aaa", borderRadius: 8 }}
                  labelStyle={{ color: "#333", fontSize: 15 }}
                >
                  Não
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmarConexao}
                  style={{
                    flex: 1,
                    backgroundColor: "#c62828",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fff", fontSize: 15 }}
                >
                  Sim
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Tela 3 — Aviso criptografia */}
        <Modal
          visible={modalAviso}
          transparent
          animationType="fade"
          onRequestClose={handleCancelarAviso}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                width: "88%",
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 64, marginBottom: 16 }}>⚠️</Text>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 10,
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: "center",
                    color: "#222",
                    fontWeight: "bold",
                    lineHeight: 22,
                  }}
                >
                  Esta rede possui segurança{"\n"}limitada.{"\n"}
                  Seus dados podem não estar{"\n"}totalmente protegidos.
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: "#555",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Rede com proteção fraca. Evite acessar informações sensíveis.
              </Text>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#222",
                  marginBottom: 24,
                  lineHeight: 30,
                }}
              >
                Deseja conectar mesmo assim?
              </Text>

              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <Button
                  mode="outlined"
                  onPress={handleCancelarAviso}
                  style={{ flex: 1, borderColor: "#aaa", borderRadius: 8 }}
                  labelStyle={{ color: "#333", fontSize: 15 }}
                >
                  Não
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConectarMesmoAssim}
                  style={{
                    flex: 1,
                    backgroundColor: "#c62828",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fff", fontSize: 15 }}
                >
                  Sim
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Snackbar */}
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={2500}
          style={{ backgroundColor: "#4caf50" }}
          action={{
            label: "Fechar",
            onPress: () => setSnackVisible(false),
          }}
        >
          ℹ️ {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
