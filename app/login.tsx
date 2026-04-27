import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  function handleLogar() {
    if (!email || !senha) {
      setSnackMessage("Preencha todos os campos!");
      setVisible(true);
      return;
    }
    setSnackMessage("Entrando...");
    setVisible(true);
    console.log("Login com:", { email });

    // Voltar para a tela inicial após 2.5 segundos
    setTimeout(() => {
      router.replace("/");
    }, 2500);
  }

  function handleEsqueciSenha() {
    router.push("/esqueci-senha");
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: "#e8e8e8" }}>
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

        {/* Conteúdo */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e8e8e8",
          }}
        >
          {/* Card */}
          <View
            style={{
              backgroundColor: "#d4d4d4",
              borderRadius: 10,
              width: "82%",
              overflow: "hidden",
            }}
          >
            {/* Título */}
            <View
              style={{
                backgroundColor: "#1a3a1a",
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                  letterSpacing: 2,
                }}
              >
                LOGIN
              </Text>
            </View>

            {/* Campos */}
            <View style={{ padding: 20, gap: 12 }}>
              <View>
                <Text style={{ fontSize: 13, marginBottom: 4, color: "#333" }}>
                  Email
                </Text>
                <TextInput
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChangeText={(texto: string) => setEmail(texto)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: "#ffffff", height: 44 }}
                  outlineStyle={{ borderColor: "#aaa" }}
                  contentStyle={{ fontSize: 13 }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, marginBottom: 4, color: "#333" }}>
                  Senha
                </Text>
                <TextInput
                  value={senha}
                  onChangeText={(texto: string) => setSenha(texto)}
                  mode="outlined"
                  secureTextEntry={!mostrarSenha}
                  right={
                    <TextInput.Affix
                      text={mostrarSenha ? "Hide" : "Show"}
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff", height: 44 }}
                  outlineStyle={{ borderColor: "#aaa" }}
                  contentStyle={{ fontSize: 13 }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleLogar}
                style={{
                  backgroundColor: "#1a3a1a",
                  borderRadius: 8,
                  marginTop: 4,
                  alignSelf: "center",
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: "#ffffff", fontSize: 15 }}
              >
                Logar
              </Button>

              <Button
                mode="text"
                onPress={handleEsqueciSenha}
                style={{ alignSelf: "center" }}
                labelStyle={{ color: "#444", fontSize: 13 }}
              >
                Esqueci senha
              </Button>
            </View>
          </View>
        </View>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={2500}
          action={{
            label: "Fechar",
            onPress: () => console.log("Snack fechado"),
          }}
        >
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
