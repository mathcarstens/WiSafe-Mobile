import { AppHeader } from "@/src/components/AppHeader";
import { auth, db } from "@/src/services/firebase";
import { getStoredUser, saveStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function EditarConta() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  useEffect(() => {
    getStoredUser().then((user) => {
      if (user) {
        setNome(user.nome || "");
        setEmail(user.email || "");
      }
    });
  }, []);

  async function handleSalvar() {
    if (!nome.trim() || !email.trim()) {
      setSnackMessage("Preencha nome e email.");
      setVisible(true);
      return;
    }

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
      setSnackMessage("As novas senhas nao coincidem.");
      setVisible(true);
      return;
    }

    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        setSnackMessage("Usuario nao autenticado.");
        setVisible(true);
        return;
      }

      if (senhaAtual && (email.trim() !== currentUser.email || novaSenha)) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          senhaAtual,
        );

        await reauthenticateWithCredential(currentUser, credential);
      }

      if (email.trim() !== currentUser.email) {
        await updateEmail(currentUser, email.trim());
      }

      if (novaSenha.trim()) {
        await updatePassword(currentUser, novaSenha);
      }

      await updateDoc(doc(db, "usuarios", currentUser.uid), {
        nome: nome.trim(),
        email: email.trim(),
      });

      await saveStoredUser({
        nome: nome.trim(),
        email: email.trim(),
        rememberMe: true,
      });

      setSnackMessage("Conta atualizada com sucesso.");
      setVisible(true);

      setTimeout(() => router.back(), 1600);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/wrong-password") {
        setSnackMessage("Senha atual incorreta.");
      } else if (error.code === "auth/email-already-in-use") {
        setSnackMessage("Esse email ja esta em uso.");
      } else if (error.code === "auth/requires-recent-login") {
        setSnackMessage("Faca login novamente para alterar dados sensiveis.");
      } else {
        setSnackMessage("Erro ao atualizar conta.");
      }

      setVisible(true);
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
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ backgroundColor: "#dcdcdc", borderRadius: 12, overflow: "hidden" }}>
            <View style={{ backgroundColor: "#000000", paddingVertical: 16, alignItems: "center" }}>
              <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "bold" }}>
                Editar Conta
              </Text>
            </View>

            <View style={{ padding: 18, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>
                  Nome
                </Text>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  mode="outlined"
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>
                  Senha Atual
                </Text>
                <TextInput
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  mode="outlined"
                  secureTextEntry={!mostrarSenhaAtual}
                  right={
                    <TextInput.Icon
                      icon={mostrarSenhaAtual ? "eye-off" : "eye"}
                      onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>
                  Nova Senha
                </Text>
                <TextInput
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarNovaSenha}
                  right={
                    <TextInput.Icon
                      icon={mostrarNovaSenha ? "eye-off" : "eye"}
                      onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 15, marginBottom: 6, color: "#222" }}>
                  Confirmar Nova Senha
                </Text>
                <TextInput
                  value={confirmarNovaSenha}
                  onChangeText={setConfirmarNovaSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarConfirmarSenha}
                  right={
                    <TextInput.Icon
                      icon={mostrarConfirmarSenha ? "eye-off" : "eye"}
                      onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    />
                  }
                  style={{ backgroundColor: "#ffffff" }}
                  outlineStyle={{ borderColor: "#b0b0b0" }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSalvar}
                style={{ backgroundColor: "#000000", borderRadius: 10, marginTop: 12 }}
                contentStyle={{ height: 48 }}
                labelStyle={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
              >
                Salvar
              </Button>
            </View>
          </View>
        </ScrollView>

        <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={2500}>
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
