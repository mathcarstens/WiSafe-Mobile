import { MD3LightTheme } from "react-native-paper";

const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1a3a6b",
    secondary: "#1a3a1a",
    background: "#e8e8e8",
    surface: "#ffffff",
  },
};

export default CustomLightTheme;
