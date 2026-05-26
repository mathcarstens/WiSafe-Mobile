import { AppHeader } from "@/src/components/AppHeader";
import { auth } from "@/src/services/firebase";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirmar() {
    if (!email.trim()) {
      setSnackMessage("Informe seu e-mail.");
      setVisible(true);
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSnackMessage("Email de redefinicao enviado com sucesso.");
      setVisible(true);
      setTimeout(() => {
        router.replace("/login");
      }, 2500);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/user-not-found") {
        setSnackMessage("Nenhum usuario encontrado com esse email.");
      } else if (error.code === "auth/invalid-email") {
        setSnackMessage("Email invalido.");
      } else {
        setSnackMessage("Erro ao enviar email de redefinicao.");
      }

      setVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
        <AppHeader />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              backgroundColor: "#dcdcdc",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                backgroundColor: "#1a3a6b",
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "bold" }}>
                Recuperar Senha
              </Text>
            </View>

            <View style={{ padding: 18, gap: 16 }}>
              <Text style={{ fontSize: 15, color: "#333", lineHeight: 22 }}>
                Informe o email da sua conta. Voce recebera um link para redefinir sua senha.
              </Text>

              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>Email</Text>

                <TextInput
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleConfirmar}
                loading={loading}
                disabled={loading}
                style={{
                  backgroundColor: "#1a3a6b",
                  borderRadius: 10,
                  marginTop: 8,
                  paddingVertical: 4,
                }}
                labelStyle={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
              >
                Enviar Email
              </Button>
            </View>
          </View>
        </ScrollView>

        <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000}>
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
