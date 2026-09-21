import { Image, View } from "react-native";
import { Text } from "react-native-paper";

const headerIcon = require("../../assets/images/wifi-protect.jpeg");

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
        <Image
          source={headerIcon}
          style={{ width: 26, height: 26, borderRadius: 13 }}
          resizeMode="cover"
        />
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
