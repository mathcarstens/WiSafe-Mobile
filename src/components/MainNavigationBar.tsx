import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button } from "react-native-paper";

type MainNavigationBarProps = {
  active: "scan" | "favorites" | "account";
  loadingScan?: boolean;
  onScanPress?: () => void;
};

export function MainNavigationBar({
  active,
  loadingScan = false,
  onScanPress,
}: MainNavigationBarProps) {
  const router = useRouter();

  const activeButtonStyle = { flex: 1, borderRadius: 8, backgroundColor: "#1a3a6b" };
  const inactiveButtonStyle = { flex: 1, borderRadius: 8 };

  function handleScanPress() {
    if (active === "scan") {
      onScanPress?.();
      return;
    }

    router.push("/home");
  }

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        padding: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#dbe3ef",
      }}
    >
      <Button
        mode={active === "scan" ? "contained" : "outlined"}
        icon="wifi-sync"
        loading={loadingScan}
        disabled={loadingScan}
        onPress={handleScanPress}
        style={active === "scan" ? activeButtonStyle : inactiveButtonStyle}
        labelStyle={{ fontSize: 12 }}
        textColor={active === "scan" ? "#ffffff" : "#1a3a6b"}
      >
        Escanear
      </Button>
      <Button
        mode={active === "favorites" ? "contained" : "outlined"}
        icon="star"
        onPress={() => active !== "favorites" && router.push("/favorites")}
        style={active === "favorites" ? activeButtonStyle : inactiveButtonStyle}
        labelStyle={{ fontSize: 12 }}
        textColor={active === "favorites" ? "#ffffff" : "#1a3a6b"}
      >
        Favoritos
      </Button>
      <Button
        mode={active === "account" ? "contained" : "outlined"}
        icon="account"
        onPress={() => active !== "account" && router.push("/account")}
        style={active === "account" ? activeButtonStyle : inactiveButtonStyle}
        labelStyle={{ fontSize: 12 }}
        textColor={active === "account" ? "#ffffff" : "#1a3a6b"}
      >
        Conta
      </Button>
    </View>
  );
}
