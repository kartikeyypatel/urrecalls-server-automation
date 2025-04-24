import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox, Appearance, StatusBar, View } from "react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
import RootNavigator from "~/navigators/root_navigator";
import * as SecureStore from "expo-secure-store";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import { main_theme, dark_theme, get_theme_color } from "styles/main_styles";
import { initialize_localization } from "~/utility/utility";
import { NavigationTheme } from "react-native-paper/lib/typescript/types";
import { TokenCache } from "@clerk/clerk-expo/dist/cache";

// Importing this for new ReanimatedSwipeable Functionality
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Ignore logs
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
LogBox.ignoreAllLogs();

// Clerk token cache
const tokenCache: TokenCache = {
  getToken: (key) => {
    return SecureStore.getItemAsync(key);
  },
  saveToken: (key, token) => {
    return SecureStore.setItemAsync(key, token);
  },
};

const CLERK_PUBLISHABLE_KEY: string = process.env.CLERK_PUBLISHABLE_KEY != undefined ?
  process.env.CLERK_PUBLISHABLE_KEY :
  "no key found";

// Navigation theme
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: main_theme as unknown as NavigationTheme,
  reactNavigationDark: dark_theme as unknown as NavigationTheme,
});

// Initialize i18n
initialize_localization();

function App() {
  const [colorScheme, setColorScheme] = React.useState(
    Appearance.getColorScheme()
  );

  React.useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const theme = colorScheme === "dark" ? dark_theme : main_theme;
  const navigation_theme = colorScheme === "dark" ? DarkTheme : LightTheme;

  return (
    // Wrapping everything with GesterHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={get_theme_color(theme, "background")}
        />
        <PaperProvider theme={theme}>
          <NavigationContainer theme={navigation_theme}>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

export default App;
