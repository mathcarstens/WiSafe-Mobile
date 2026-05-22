import { saveStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "@/src/services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Registro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

 async function handleRegistrar() {
  if (!nome || !email || !telefone || !senha || !confirmarSenha) {
    setSnackMessage("Preencha todos os campos!");
    setVisible(true);
    return;
  }

  if (senha !== confirmarSenha) {
    setSnackMessage("As senhas não coincidem!");
    setVisible(true);
    return;
  }

  try {
    // aqui ta criando o usuario no Firebase Authentication usando a funcao 
    // createUserWithEmailAndPassword, que recebe o email e a senha do usuario e cria 
    // uma nova conta. Se der certo, ele retorna um objeto userCredential com as informacoes 
    // do usuario criado.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );

    const user = userCredential.user;

    // salvando os dados no firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      criadoEm: new Date(),
    });

    // aqui ta salvando os dados do usuario no localStorage usando a funcao saveStoredUser,
    // que recebe um objeto com as informacoes do usuario e salva no armazenamento local do dispositivo.
    await saveStoredUser({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      rememberMe: true,
    });

    setSnackMessage("Cadastro realizado com sucesso!");
    setVisible(true);

    console.log("Usuário registrado:", user.uid);

    setTimeout(() => {
      router.replace("/");
    }, 2500);

  } catch (error: any) {
    console.log(error);

    if (error.code === "auth/email-already-in-use") {
      setSnackMessage("Esse email já está em uso.");
    } else if (error.code === "auth/invalid-email") {
      setSnackMessage("Email inválido.");
    } else if (error.code === "auth/weak-password") {
      setSnackMessage("A senha deve ter pelo menos 6 caracteres.");
    } else {
      setSnackMessage("Erro ao cadastrar usuário.");
    }

    setVisible(true);
  }
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

        {/* Conteúdo central */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e8e8e8",
          }}
        >
          {/* Card do formulário */}
          <View
            style={{
              backgroundColor: "#d4d4d4",
              borderRadius: 10,
              width: "82%",
              overflow: "hidden",
            }}
          >
            {/* Título do card */}
            <View
              style={{
                backgroundColor: "#000000",
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Registro
              </Text>
            </View>

            {/* Campos do formulário */}
            <View style={{ padding: 20, gap: 12 }}>
              <View>
                <Text style={{ fontSize: 13, marginBottom: 4, color: "#333" }}>
                  Nome
                </Text>
                <TextInput
                  placeholder="Digite seu nome"
                  value={nome}
                  onChangeText={(texto: string) => setNome(texto)}
                  mode="outlined"
                  style={{ backgroundColor: "#ffffff", height: 44 }}
                  outlineStyle={{ borderColor: "#aaa" }}
                  contentStyle={{ fontSize: 13 }}
                />
              </View>

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
                  Telefone
                </Text>
                <TextInput
                  placeholder="Digite seu número"
                  value={telefone}
                  onChangeText={(texto: string) => setTelefone(texto)}
                  mode="outlined"
                  keyboardType="phone-pad"
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

              <View>
                <Text style={{ fontSize: 13, marginBottom: 4, color: "#333" }}>
                  Confirmar senha
                </Text>
                <TextInput
                  value={confirmarSenha}
                  onChangeText={(texto: string) => setConfirmarSenha(texto)}
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
                  style={{ backgroundColor: "#ffffff", height: 44 }}
                  outlineStyle={{ borderColor: "#aaa" }}
                  contentStyle={{ fontSize: 13 }}
                />
              </View>

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
