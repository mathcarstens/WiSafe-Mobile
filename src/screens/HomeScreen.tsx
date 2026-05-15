import { useRouter } from "expo-router";
import { ImageBackground, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
      <AppHeader />

      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900",
        }}
        style={{ height: 260, justifyContent: "flex-end" }}
        imageStyle={{ opacity: 0.75 }}
      >
        <View style={{ padding: 24, paddingBottom: 30 }}>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 34,
              fontWeight: "bold",
              textShadowColor: "rgba(0,0,0,0.75)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 5,
            }}
          >
            WiSafe
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 17,
              marginTop: 6,
              textShadowColor: "rgba(0,0,0,0.75)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 4,
            }}
          >
            Saiba se o Wi-Fi e seguro antes de conectar.
          </Text>
        </View>
      </ImageBackground>

      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
        <Button
          mode="contained"
          icon="login"
          onPress={() => router.push("/login")}
          style={{ borderRadius: 8, backgroundColor: "#1a3a6b" }}
          contentStyle={{ height: 48 }}
        >
          Comecar
        </Button>
        <Button
          mode="outlined"
          icon="account-plus"
          onPress={() => router.push("/registro")}
          style={{ borderRadius: 8, borderColor: "#1a3a6b" }}
          textColor="#1a3a6b"
          contentStyle={{ height: 48 }}
        >
          Criar conta
        </Button>
      </View>
    </SafeAreaView>
  );
}
