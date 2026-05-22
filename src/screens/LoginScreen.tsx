import { AppHeader } from "@/src/components/AppHeader";
import { auth, db } from "@/src/services/firebase";
import { getStoredUser, saveStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, Checkbox, Snackbar, Text, TextInput, } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

//aqui ta a tela de login, onde o usuario pode entrar com seu email e senha, ou ir para a tela de registro ou de esqueci senha.
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
      setSnackMessage("Informe seu e-mail.");
      setSnackVisible(true);
      return;
    }

    if (!senha.trim()) {
      setSnackMessage("Informe sua senha.");
      setSnackVisible(true);
      return;
    }

    try {
      // Login Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );

      const firebaseUser = userCredential.user;

      // Buscar dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));

      const userData = userDoc.data();

      // Salvar localmente
      if (lembrar) {
        await saveStoredUser({
          nome: userData?.nome || "",
          email: firebaseUser.email || "",
          telefone: userData?.telefone || "",
          rememberMe: true,
        });
      }

      setSnackMessage("Login realizado com sucesso!");
      setSnackVisible(true);

      console.log("Usuário logado:", firebaseUser.uid);

      setTimeout(() => {
        router.replace("/home");
      }, 1500);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/user-not-found") {
        setSnackMessage("Usuário não encontrado.");
      } else if (error.code === "auth/wrong-password") {
        setSnackMessage("Senha incorreta.");
      } else if (error.code === "auth/invalid-email") {
        setSnackMessage("Email inválido.");
      } else if (error.code === "auth/invalid-credential") {
        setSnackMessage("Email ou senha incorretos.");
      } else {
        setSnackMessage("Erro ao realizar login.");
      }

      setSnackVisible(true);
    }
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
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#1f2937" }}
            >
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
