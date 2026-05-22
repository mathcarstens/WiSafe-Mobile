import { AppHeader } from "@/src/components/AppHeader";
import { clearStoredUser, getStoredUser } from "@/src/storage/userStorage";
import { StoredUser } from "@/src/types/wifi";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Avatar, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

//essa funcao faz a tela de conta do usuario, 
// onde ele pode ver suas informacoes e deslogar. 

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    getStoredUser().then(setUser);
  }, []);

  async function handleDeslogar() {
    await clearStoredUser();
    router.replace("/login");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f6" }}>
      <AppHeader />

      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 22,
          paddingTop: 70,
          paddingBottom: 34,
        }}
      >
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#dbe3ef",
            paddingVertical: 22,
            paddingHorizontal: 18,
            alignItems: "center",
          }}
        >
          <Avatar.Icon
            size={96}
            icon="account"
            color="#ffffff"
            style={{ backgroundColor: "#333333", marginBottom: 10 }}
          />

          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
            {user?.nome || "Usuario WiSafe"}
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8 }}>
            {user?.email || "email nao informado"}
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 6 }}>
            {user?.telefone || "Telefone nao informado"}
          </Text>

          <Button
            mode="text"
            icon="account-edit"
            onPress={() => router.push("./edit-account")}
            style={{ alignSelf: "flex-start", marginTop: 6 }}
            textColor="#111827"
          >
            Editar
          </Button>
        </View>

        <Button
          mode="contained"
          icon="logout"
          onPress={handleDeslogar}
          style={{
            alignSelf: "center",
            borderRadius: 6,
            backgroundColor: "#000000",
          }}
          labelStyle={{ color: "#ffffff" }}
        >
          Deslogar
        </Button>
      </View>
    </SafeAreaView>
  );
}
