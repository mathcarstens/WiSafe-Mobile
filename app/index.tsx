import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  function handleNaoPossuoConta() {
    router.push("/registro");
  }

  function handleJaPossuoConta() {
    router.push("/login");
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: "#e8e8e8" }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header com logo */}
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
          {/* Ícone de escudo simulado com View */}
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
            <Text style={{ color: "#fff", fontSize: 16 }}>🛡️</Text>
          </View>

          <Text
            style={{
              color: "#ffffff",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Wifi-Protect
          </Text>
        </View>

        {/* Imagem de fundo com texto sobreposto */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
          }}
          style={{
            height: 220,
            justifyContent: "center",
            alignItems: "center",
          }}
          imageStyle={{ opacity: 0.7 }}
        >
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 16,
              marginHorizontal: 30,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 22,
                fontWeight: "bold",
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 4,
              }}
            >
              Mais segurança para suas conexões.
            </Text>
          </View>
        </ImageBackground>

        {/* Área dos botões */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e8e8e8",
          }}
        >
          <View
            style={{
              backgroundColor: "#d4d4d4",
              borderRadius: 12,
              padding: 24,
              width: "80%",
              gap: 16,
            }}
          >
            <Button
              mode="contained"
              onPress={handleNaoPossuoConta}
              style={{ backgroundColor: "#1a3a6b", borderRadius: 8 }}
              labelStyle={{
                color: "#ffffff",
                fontSize: 15,
                paddingVertical: 4,
              }}
            >
              Não possuo conta
            </Button>

            <Button
              mode="contained"
              onPress={handleJaPossuoConta}
              style={{ backgroundColor: "#1a3a6b", borderRadius: 8 }}
              labelStyle={{
                color: "#ffffff",
                fontSize: 15,
                paddingVertical: 4,
              }}
            >
              Já possuo conta
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
