import { StyleSheet } from "react-native";
import { normalizeText } from "react-native-elements/dist/helpers";
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";

/**
 * Standard unit based on normalized values to maintain consistency between different screen sizes.
 */
export const em = normalizeText(16);

export type ThemeColor =
  | "primary"
  | "onPrimary"
  | "primaryContainer"
  | "onPrimaryContainer"
  | "secondary"
  | "onSecondary"
  | "secondaryContainer"
  | "onSecondaryContainer"
  | "tertiary"
  | "onTertiary"
  | "tertiaryContainer"
  | "onTertiaryContainer"
  | "error"
  | "onError"
  | "errorContainer"
  | "onErrorContainer"
  | "background"
  | "onBackground"
  | "surface"
  | "onSurface"
  | "surfaceVariant"
  | "onSurfaceVariant"
  | "outline";

/**
 * Return the appropriate color value based on the theme.
 * @param theme
 * @param theme_color
 * @returns
 */
export function get_theme_color(
  theme: MD3Theme,
  theme_color?: ThemeColor
): string {
  return theme_color != undefined ? theme.colors[theme_color] : "onBackground";
}

/**
 * The main theme for the application.
 */
export const main_theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    primary: "rgb(0, 101, 142)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(252, 252, 255)",
    onPrimaryContainer: "rgb(0, 30, 46)",
    secondary: "rgb(0, 109, 66)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(147, 247, 187)",
    onSecondaryContainer: "rgb(0, 82, 40)",
    tertiary: "rgb(132, 70, 142)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(254, 214, 255)",
    onTertiaryContainer: "rgb(53, 0, 65)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(133, 1, 6)",
    background: "rgb(199, 231, 255)",
    onBackground: "rgb(25, 28, 30)",
    surface: "rgb(252, 252, 255)",
    onSurface: "rgb(25, 28, 30)",
    surfaceVariant: "rgb(221, 227, 234)",
    onSurfaceVariant: "rgb(65, 72, 77)",
    outline: "rgb(113, 120, 126)",
    outlineVariant: "rgb(193, 199, 206)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(46, 49, 51)",
    inverseOnSurface: "rgb(240, 241, 243)",
    inversePrimary: "rgb(131, 207, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(239, 244, 249)",
      level2: "rgb(232, 240, 246)",
      level3: "rgb(224, 235, 243)",
      level4: "rgb(222, 234, 241)",
      level5: "rgb(217, 231, 239)",
    },
    surfaceDisabled: "rgba(25, 28, 30, 0.12)",
    onSurfaceDisabled: "rgba(25, 28, 30, 0.38)",
    backdrop: "rgba(43, 49, 54, 0.4)",
  },
};

/**
 * The dark theme for the application. Dynamic theme switching is handled automatically.
 */
export const dark_theme = {
  ...MD3DarkTheme,
  colors: {
    primary: "rgb(131, 207, 255)",
    onPrimary: "rgb(0, 52, 76)",
    primaryContainer: "rgb(25, 28, 30)",
    onPrimaryContainer: "rgb(199, 231, 255)",
    secondary: "rgb(119, 218, 160)",
    onSecondary: "rgb(0, 57, 32)",
    secondaryContainer: "rgb(0, 82, 48)",
    onSecondaryContainer: "rgb(147, 247, 187)",
    tertiary: "rgb(246, 173, 254)",
    onTertiary: "rgb(80, 21, 92)",
    tertiaryContainer: "rgb(105, 46, 117)",
    onTertiaryContainer: "rgb(254, 214, 255)",
    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(0, 76, 108)",
    onBackground: "rgb(226, 226, 229)",
    surface: "rgb(25, 28, 30)",
    onSurface: "rgb(226, 226, 229)",
    surfaceVariant: "rgb(65, 72, 77)",
    onSurfaceVariant: "rgb(193, 199, 206)",
    outline: "rgb(139, 145, 152)",
    outlineVariant: "rgb(65, 72, 77)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(226, 226, 229)",
    inverseOnSurface: "rgb(46, 49, 51)",
    inversePrimary: "rgb(0, 101, 142)",
    elevation: {
      level0: "transparent",
      level1: "rgb(30, 37, 41)",
      level2: "rgb(34, 42, 48)",
      level3: "rgb(37, 48, 55)",
      level4: "rgb(38, 50, 57)",
      level5: "rgb(40, 53, 62)",
    },
    surfaceDisabled: "rgba(226, 226, 229, 0.12)",
    onSurfaceDisabled: "rgba(226, 226, 229, 0.38)",
    backdrop: "rgba(43, 49, 54, 0.4)",
  },
};

/**
 * The main styling for the application.
 */
export const styles = StyleSheet.create({
  /**
   * Styling for user detail text in the profile screen.
   */
  userDetailText: {
    display: "flex",
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#555",
    marginVertical: 4,
  },
  /**
   * Styling for labels (e.g., "Name", "Email").
   */
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  /**
   * Styling for text.
   */
  Text: {
    display: "flex",
    alignSelf: "flex-start",
    fontSize: em,
  },

  /**
   * Styling for Larger Text.
   */
  LargeText: {
    display: "flex",
    alignSelf: "flex-start",
    fontSize: 1.25 * em,
  },

  /**
   * Styling for H1.
   */
  H1: {
    fontSize: (8 / 3) * em,
    fontWeight: "bold",
    marginTop: (5 / 6) * em,
    marginBottom: (5 / 6) * em,
  },

  /**
   * Styling for H2.
   */
  H2: {
    fontSize: 2 * em,
    fontWeight: "bold",
    marginTop: (2 / 3) * em,
    marginBottom: (2 / 3) * em,
  },

  bold: {
    fontWeight: "bold",
  },

  /**
   * Styling for primary text input.
   */
  TextInput: { marginTop: 0.25 * em, marginBottom: 0.25 * em },

  /**
   * Styling for a touchable ripple.
   */
  Touchable: {
    display: "flex",
  },

  /**
   * Styling for text buttons.
   */
  TextButton: {
    alignSelf: "flex-start",
  },

  /**
   * Styling for page container containing an entire screen.
   */
  Page: {
    flex: 1,
  },

  /**
   * Styling for container.
   */
  Container: {
    display: "flex",
    flexGrow: 1,
    paddingLeft: 2 * em,
    paddingRight: 2 * em,
  },

  /*  Generic styles for component  */

  /**
   * Styling to make container's children horizontally centered.
   */
  h_centered_container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * The default stylesheet for the application.
 */
export default styles;
