import { AppHeader } from "@/src/components/AppHeader";
import { auth } from "@/src/services/firebase";
import { clearStoredUser } from "@/src/storage/userStorage";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogoutConfirmScreen() {
  const router = useRouter();

  async function handleConfirmLogout() {
    await clearStoredUser();
    await signOut(auth);
    router.replace("/");
  }

  function handleCancelLogout() {
    router.replace("/account");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingBottom: 42,
        }}
      >
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#d7dce3",
            minHeight: 172,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 22,
          }}
        >
          <Text
            style={{
              color: "#000000",
              fontSize: 30,
              fontWeight: "bold",
              lineHeight: 36,
              textAlign: "center",
            }}
          >
            Deseja deslogar sua conta?
          </Text>
        </View>

        <View style={{ alignItems: "center", gap: 16, marginTop: 38 }}>
          <Button
            mode="contained"
            onPress={handleConfirmLogout}
            style={{
              width: 132,
              borderRadius: 8,
              backgroundColor: "#000000",
            }}
            contentStyle={{ height: 44 }}
            labelStyle={{ color: "#ffffff", fontSize: 15, lineHeight: 18 }}
          >
            Sim
          </Button>

          <Button
            mode="contained"
            onPress={handleCancelLogout}
            style={{
              width: 132,
              borderRadius: 8,
              backgroundColor: "#000000",
            }}
            contentStyle={{ height: 44 }}
            labelStyle={{ color: "#ffffff", fontSize: 15, lineHeight: 18 }}
          >
            Nao
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
