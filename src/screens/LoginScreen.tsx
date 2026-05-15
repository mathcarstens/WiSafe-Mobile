import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, Checkbox, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";
import { getStoredUser, saveStoredUser } from "@/src/storage/userStorage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  useEffect(() => {
    getStoredUser().then((user) => {
      if (user?.rememberMe) {
        setEmail(user.email);
        setLembrar(true);
      }
    });
  }, []);

  async function handleEntrar() {
    if (!email.trim()) {
      setSnackMessage("Informe seu nome ou e-mail.");
      setSnackVisible(true);
      return;
    }

    if (lembrar) {
      await saveStoredUser({ email: email.trim(), rememberMe: true });
    }

    router.replace("/home");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
      <AppHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              padding: 20,
              gap: 14,
              borderWidth: 1,
              borderColor: "#dbe3ef",
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1f2937" }}>
              Login
            </Text>

            <TextInput
              label="Nome ou e-mail"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              label="Senha opcional"
              value={senha}
              onChangeText={setSenha}
              mode="outlined"
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              right={
                <TextInput.Icon
                  icon={mostrarSenha ? "eye-off" : "eye"}
                  onPress={() => setMostrarSenha((value) => !value)}
                />
              }
            />

            <Checkbox.Item
              label="Lembrar de mim"
              status={lembrar ? "checked" : "unchecked"}
              onPress={() => setLembrar((value) => !value)}
              style={{ paddingHorizontal: 0 }}
            />

            <Button
              mode="contained"
              icon="login"
              onPress={handleEntrar}
              style={{ borderRadius: 8, backgroundColor: "#1a3a6b" }}
              contentStyle={{ height: 46 }}
            >
              Entrar
            </Button>

            <Button mode="text" onPress={() => router.push("/esqueci-senha")}>
              Esqueci senha
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
