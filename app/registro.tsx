import { AppHeader } from "@/src/components/AppHeader";
import { auth, db } from "@/src/services/firebase";
import { saveStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Registro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  async function handleRegistrar() {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setSnackMessage("Preencha todos os campos.");
      setVisible(true);
      return;
    }

    if (senha !== confirmarSenha) {
      setSnackMessage("As senhas nao coincidem.");
      setVisible(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome.trim(),
        email: email.trim(),
        criadoEm: new Date(),
      });

      await saveStoredUser({
        nome: nome.trim(),
        email: email.trim(),
        rememberMe: true,
      });

      setSnackMessage("Cadastro realizado com sucesso.");
      setVisible(true);

      setTimeout(() => {
        router.replace("/home");
      }, 1200);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        setSnackMessage("Esse email ja esta em uso.");
      } else if (error.code === "auth/invalid-email") {
        setSnackMessage("Email invalido.");
      } else if (error.code === "auth/weak-password") {
        setSnackMessage("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setSnackMessage("Erro ao cadastrar usuario.");
      }

      setVisible(true);
    }
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: "#e8e8e8" }}>
      <SafeAreaView style={{ flex: 1 }}>
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
              alignItems: "center",
              paddingVertical: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "#d4d4d4",
                borderRadius: 10,
                width: "82%",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#000000",
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}>
                  Registro
                </Text>
              </View>

              <View style={{ padding: 20, gap: 12 }}>
                <TextInput
                  label="Nome"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChangeText={setNome}
                  mode="outlined"
                  style={{ backgroundColor: "#ffffff" }}
                />

                <TextInput
                  label="Email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: "#ffffff" }}
                />

                <TextInput
                  label="Senha"
                  value={senha}
                  onChangeText={setSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarSenha}
                  right={
                    <TextInput.Icon
                      icon={mostrarSenha ? "eye-off" : "eye"}
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff" }}
                />

                <TextInput
                  label="Confirmar senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarConfirmarSenha}
                  right={
                    <TextInput.Icon
                      icon={mostrarConfirmarSenha ? "eye-off" : "eye"}
                      onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff" }}
                />

                <Button
                  mode="contained"
                  onPress={handleRegistrar}
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 8,
                    marginTop: 4,
                    alignSelf: "center",
                    paddingHorizontal: 16,
                  }}
                  labelStyle={{ color: "#ffffff", fontSize: 15 }}
                >
                  Registrar
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={2500}>
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
