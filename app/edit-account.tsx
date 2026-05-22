import { auth, db } from "@/src/services/firebase";
import { getStoredUser, saveStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function EditarConta() {

  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const user = await getStoredUser();

      if (user) {
        setNome(user.nome || "");
        setEmail(user.email || "");
        setTelefone(user.telefone || "");
      }
    }

    carregarDados();
  }, []);

  async function handleSalvar() {
    if (!nome || !email || !telefone) {
      setSnackMessage("Preencha todos os campos!");
      setVisible(true);
      return;
    }

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
      setSnackMessage("As novas senhas não coincidem!");

      setVisible(true);
      return;
    }

    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        setSnackMessage("Usuário não autenticado.");

        setVisible(true);
        return;
      }

      //coloca os novos dados no localStorage para atualizar o perfil do usuario
      if (senhaAtual && (email !== currentUser.email || novaSenha)) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          senhaAtual,
        );

        await reauthenticateWithCredential(currentUser, credential);
      }

      // aqui ta atualizando o email do usuario, se ele tiver mudado
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email.trim());
      }

      // atualiza a senha
      if (novaSenha.trim()) {
        await updatePassword(currentUser, novaSenha);
      }

      // pega os dados e atualiza no Firestore
      await updateDoc(doc(db, "usuarios", currentUser.uid), {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });

      // atualiza os dados no localStorage para manter o perfil atualizado
      await saveStoredUser({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        rememberMe: true,
      });

      setSnackMessage("Conta atualizada com sucesso!");

      setVisible(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/wrong-password") {
        setSnackMessage("Senha atual incorreta.");
      } else if (error.code === "auth/email-already-in-use") {
        setSnackMessage("Esse email já está em uso.");
      } else if (error.code === "auth/requires-recent-login") {
        setSnackMessage("Faça login novamente para alterar dados sensíveis.");
      } else {
        setSnackMessage("Erro ao atualizar conta.");
      }

      setVisible(true);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#e8e8e8",
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#1a2a4a",
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#2a5298",
              borderWidth: 2,
              borderColor: "#4a90d9",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>🛡️</Text>
          </View>

          <Text
            style={{
              color: "#ffffff",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Wifi-Protect
          </Text>
        </View>

        {/* Scroll */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 28,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: "#dcdcdc",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Título */}
            <View
              style={{
                backgroundColor: "#000000",
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 26,
                  fontWeight: "bold",
                }}
              >
                Editar Conta
              </Text>
            </View>

            {/* Formulário */}
            <View
              style={{
                padding: 18,
                gap: 14,
              }}
            >
              {/* Nome */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Nome
                </Text>

                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  mode="outlined"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Email */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Email
                </Text>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Telefone */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Telefone
                </Text>

                <TextInput
                  value={telefone}
                  onChangeText={setTelefone}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Senha Atual */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Senha Atual
                </Text>

                <TextInput
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  mode="outlined"
                  secureTextEntry={!mostrarSenhaAtual}
                  right={
                    <TextInput.Affix
                      text={mostrarSenhaAtual ? "Hide" : "Show"}
                      onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    />
                  }
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Nova Senha */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Nova Senha
                </Text>

                <TextInput
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarNovaSenha}
                  right={
                    <TextInput.Affix
                      text={mostrarNovaSenha ? "Hide" : "Show"}
                      onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    />
                  }
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Confirmar Nova Senha */}
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#222",
                  }}
                >
                  Confirmar Nova Senha
                </Text>

                <TextInput
                  value={confirmarNovaSenha}
                  onChangeText={setConfirmarNovaSenha}
                  mode="outlined"
                  secureTextEntry={!mostrarConfirmarSenha}
                  right={
                    <TextInput.Affix
                      text={mostrarConfirmarSenha ? "Hide" : "Show"}
                      onPress={() =>
                        setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                      }
                    />
                  }
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                  outlineStyle={{
                    borderColor: "#b0b0b0",
                  }}
                />
              </View>

              {/* Botão */}
              <Button
                mode="contained"
                onPress={handleSalvar}
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 10,
                  marginTop: 12,
                  paddingVertical: 4,
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Salvar
              </Button>
            </View>
          </View>
        </ScrollView>

        {/* Snackbar */}
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={2500}
        >
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
