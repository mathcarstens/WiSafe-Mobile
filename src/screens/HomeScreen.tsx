import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/src/components/AppHeader";

const carouselImages = [
  require("../../assets/images/1.png"),
  require("../../assets/images/2.png"),
  require("../../assets/images/3.png"),
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);

  function handleCarouselScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slide);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
      <AppHeader />

      <View style={{ height: 260 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCarouselScroll}
          scrollEventThrottle={16}
          style={{ height: 260 }}
        >
          {carouselImages.map((image, index) => (
            <ImageBackground
              key={index}
              source={image}
              style={{ width, height: 260, justifyContent: "flex-end" }}
              imageStyle={{ resizeMode: "cover" }}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0,0,0,0.36)",
                }}
              />

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
          ))}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            bottom: 18,
            right: 24,
            flexDirection: "row",
            gap: 7,
          }}
        >
          {carouselImages.map((_, index) => (
            <View
              key={index}
              style={{
                width: activeSlide === index ? 18 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  activeSlide === index
                    ? "#ffffff"
                    : "rgba(255,255,255,0.58)",
              }}
            />
          ))}
        </View>
      </View>

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
