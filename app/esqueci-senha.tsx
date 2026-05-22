// os imports do firebase sao "auth" e "firestore", que sao usados
//  para lidar com a autenticacao e o banco de dados do Firebase, respectivamente.

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
  
  //a funcao handleConfirmar eh chamada quando o usuario clica no botao de enviar email, 
  // ela verifica se o email foi preenchido, e entao tenta enviar o email de redefinicao 
  // de senha usando o Firebase Authentication (Deixa isso aqui, n mexe)

  async function handleConfirmar() {
    if (!email.trim()) {
      setSnackMessage("Informe seu e-mail.");
      setVisible(true);
      return;
    }
    // tenta enviar o email de redefinicao de senha usando o Firebase Authentication, que
    // eh uma funcao que envia um email para o usuario com um link para redefinir a senha.
    //  Se der certo, mostra uma mensagem de sucesso e redireciona para a tela de login. 
    // Se der erro, mostra uma mensagem de erro especifica dependendo do 
    // tipo de erro (usuario nao encontrado, email invalido, etc).

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSnackMessage("Email de redefinição enviado com sucesso!");
      setVisible(true);
      setTimeout(() => {
        router.replace("/login");
      }, 2500);
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/user-not-found") {
        setSnackMessage("Nenhum usuário encontrado com esse email.");
      } else if (error.code === "auth/invalid-email") {
        setSnackMessage("Email inválido.");
      } else {
        setSnackMessage("Erro ao enviar email de redefinição.");
      }

      setVisible(true);
    } finally {
      setLoading(false);
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

        {/* Conteúdo */}
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
            {/* Título */}
            <View
              style={{
                backgroundColor: "#1a3a1a",
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                Recuperar Senha
              </Text>
            </View>

            {/* Formulário */}
            <View
              style={{
                padding: 18,
                gap: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: "#333",
                  lineHeight: 22,
                }}
              >
                Informe o email da sua conta. Você receberá um link para
                redefinir sua senha.
              </Text>

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
                  placeholder="Digite seu e-mail"
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

              {/* Botão */}
              <Button
                mode="contained"
                onPress={handleConfirmar}
                loading={loading}
                disabled={loading}
                style={{
                  backgroundColor: "#1a3a1a",
                  borderRadius: 10,
                  marginTop: 8,
                  paddingVertical: 4,
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Enviar Email
              </Button>
            </View>
          </View>
        </ScrollView>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
        >
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
