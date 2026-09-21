import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { getRiskColor, getRiskLabel, getSecurityLabel } from "@/src/services/wifiRules";
import { WifiNetwork } from "@/src/types/wifi";

type NetworkCardProps = {
  network: WifiNetwork;
  onPress: (network: WifiNetwork) => void;
  onToggleFavorite: (network: WifiNetwork) => void;
};

export function NetworkCard({ network, onPress, onToggleFavorite }: NetworkCardProps) {
  const riskColor = getRiskColor(network.riskLevel);
  const securityLabel = getSecurityLabel(network.securityType);
  const riskLabel = getRiskLabel(network.riskLevel);
  const lockIcon = network.securityType === "OPEN" ? "lock-open-variant" : "lock";

  return (
    <TouchableOpacity
      onPress={() => onPress(network)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        elevation: 1,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "#eef2ff",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons name="wifi" size={22} color="#1a3a6b" />
        <MaterialCommunityIcons
          name={lockIcon}
          size={13}
          color={riskColor}
          style={{ position: "absolute", right: 7, bottom: 6 }}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 16, fontWeight: "bold", color: "#1f2937" }}
        >
          {network.ssid}
        </Text>
        <Text style={{ color: riskColor, fontSize: 13, marginTop: 2 }}>
          {securityLabel} - {riskLabel}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
          Sinal {network.signalLabel.toLowerCase()}
        </Text>
      </View>

      <IconButton
        icon={network.isFavorite ? "star" : "star-outline"}
        iconColor={network.isFavorite ? "#f59e0b" : "#94a3b8"}
        size={24}
        onPress={() => onToggleFavorite(network)}
        accessibilityLabel="Alternar favorito"
      />
    </TouchableOpacity>
  );
}
