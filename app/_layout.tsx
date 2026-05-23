import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import CustomLightTheme from "../theme";

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = () => {
      SplashScreen.hideAsync().catch(() => {
        console.log("Splash ja estava oculta ou nao conseguiu ser ocultada.");
      });
    };

    hideSplash();
    const timer = setTimeout(hideSplash, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PaperProvider theme={CustomLightTheme}>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="esqueci-senha" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="network-details" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="logout" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
