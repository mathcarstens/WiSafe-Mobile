import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "react-native-paper";

export function AppHeader() {
  return (
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
        <MaterialCommunityIcons name="shield-check" size={20} color="#ffffff" />
      </View>

      <View>
        <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold" }}>
          WiSafe
        </Text>
        <Text style={{ color: "#dbeafe", fontSize: 11 }}>
          Saiba se o Wi-Fi e seguro antes de conectar.
        </Text>
      </View>
    </View>
  );
}
