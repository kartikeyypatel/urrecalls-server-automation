import React, { ReactNode, useEffect, useState } from "react";
import { Image, StyleProp, View, ViewProps, ViewStyle } from "react-native";
import { normalizeText } from "react-native-elements/dist/helpers";
import { ScrollView } from "react-native-gesture-handler";
import {
  Button,
  Text,
  TextInput,
  ToggleButton,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { get_theme_color, styles } from "styles/main_styles";
import { flatten, log, t } from "~/utility/utility";

type CustomTextProps = {
  /**
   * The text to be displayed in the element.
   */
  text?: string;
  /**
   * Children of the text node.
   */
  children?: ReactNode;
} & Omit<React.ComponentProps<typeof Text>, "children">;

type CustomTouchableProps = {
  /**
   * The text to be displayed in the element.
   */
  text?: string;
} & React.ComponentProps<typeof TouchableRipple>;

type CustomButtonProps = {
  /**
   * The text to be displayed in the element.
   */
  text?: string;
} & React.ComponentProps<typeof Button>;

type CustomPageViewProps = {
  /**
   * Children of the page view.
   */
  children?: ReactNode;
  /**
   * Style of the container's content
   */
  contentContainerStyle?: StyleProp<ViewProps>;
};

/**
 * Generic text react component.
 * @returns
 */
export function NormalText({
  children,
  text,
  style,
  ...props
}: CustomTextProps): React.JSX.Element {
  return (
    <Text
      textBreakStrategy="simple"
      style={style != undefined ? flatten([styles.Text, style]) : styles.Text}
      {...props}
    >
      {text}
      {children}
    </Text>
  );
}
/**
 * Generic H1 text react component.
 * @returns
 */
export function H1Text({
  children,
  text,
  style,
  ...props
}: CustomTextProps): React.JSX.Element {
  return (
    <Text
      textBreakStrategy="simple"
      style={style != undefined ? flatten([styles.H1, style]) : styles.H1}
      {...props}
    >
      {text}
      {children}
    </Text>
  );
}

/**
 * Generic H2 text react component.
 * @returns
 */
export function H2Text({
  children,
  text,
  style,
  ...props
}: CustomTextProps): React.JSX.Element {
  return (
    <Text
      textBreakStrategy="simple"
      style={style != undefined ? flatten([styles.H2, style]) : styles.H2}
      {...props}
    >
      {text}
      {children}
    </Text>
  );
}

/**
 * Generic larger than normal text react component.
 * @returns
 */
export function LargeText({
  children,
  text,
  style,
  ...props
}: CustomTextProps): React.JSX.Element {
  return (
    <Text
      textBreakStrategy="simple"
      style={
        style != undefined
          ? flatten([styles.LargeText, style])
          : styles.LargeText
      }
      {...props}
    >
      {text}
      {children}
    </Text>
  );
}

/**
 * Formatted TextInput react native paper component;
 * @returns
 */
export function FTextInput({
  children,
  style,
  mode,
  secureTextEntry,
  value,
  ...props
}: React.ComponentProps<typeof TextInput>): React.JSX.Element {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);
  return (
    <TextInput
      mode={mode != undefined ? mode : "outlined"}
      style={
        style != undefined
          ? flatten([styles.TextInput, style])
          : styles.TextInput
      }
      secureTextEntry={isSecure}
      value={value}
      //  The eye only appears if it is for a password (isSecure != undefined)
      //  and there is some text (value != undefined && value.length > 0).
      right={
        isSecure != undefined && value != undefined && value.length > 0 ? (
          <TextInput.Icon
            icon={isSecure ? "eye" : "eye-off"}
            forceTextInputFocus={false}
            onPress={() => {
              setIsSecure(!isSecure);
            }}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </TextInput>
  );
}

/**
 * Formatted TouchableRipple react native paper component;
 * @returns
 */
export function Touchable({
  children,
  text,
  style,
  ...props
}: CustomTouchableProps): React.JSX.Element {
  return (
    <TouchableRipple
      style={
        style != undefined
          ? flatten([styles.Touchable, style])
          : styles.Touchable
      }
      borderless={true}
      {...props}
    >
      {text != undefined ? text : children}
    </TouchableRipple>
  );
}

/**
 * Formatted Button react native paper component;
 * @returns
 */
export function TextButton({
  children,
  style,
  text,
  contentStyle,
  mode,
  ...props
}: CustomButtonProps): React.JSX.Element {
  return (
    <Button
      style={
        style != undefined
          ? (flatten([styles.TextButton, style]) as ViewStyle)
          : styles.TextButton
      }
      mode={mode != undefined ? mode : "contained"}
      contentStyle={
        contentStyle != undefined
          ? contentStyle
          : {
              paddingTop: normalizeText(2.5),
              paddingBottom: normalizeText(2.5),
              paddingLeft: normalizeText(20),
              paddingRight: normalizeText(20),
            }
      }
      compact
      {...props}
    >
      {text}
      {children}
    </Button>
  );
}

type StatefulButtonProps = {
  /**
   * Icon that will be shown when the button is active.
   */
  active_icon: string;

  /**
   * Icon that will be shown when the button is inactive.
   */
  inactive_icon: string;
} & Omit<React.ComponentProps<typeof ToggleButton>, "icon">;

/**
 * Formatted stateful button that toggles shows two different icons when active and inactive.
 * @returns
 */
export function StatefulButton({
  style,
  status,
  active_icon,
  inactive_icon,
  ...props
}: StatefulButtonProps): React.JSX.Element {
  return (
    <ToggleButton
      style={style}
      icon={status == "checked" ? active_icon : inactive_icon}
      //  Does not keep status to hide the active tint
      {...props}
    ></ToggleButton>
  );
}

/**
 * Returns the application logo.
 */
export function Logo() {
  return (
    <View style={styles.h_centered_container}>
      <Image
        source={require("assets/UrRecallsLogo.png")}
        style={{
          width: normalizeText(230),
          height: "auto",
          aspectRatio: "1.61",
        }}
      />
    </View>
  );
}

/**
 * Generic contrainer for a screen.
 * @param param0
 * @returns
 */
export function PageView({
  children,
  contentContainerStyle,
}: CustomPageViewProps) {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{
        ...styles.Page,
        backgroundColor: get_theme_color(theme, "background"),
      }}
    >
      <ScrollView
        style={styles.Container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={flatten([
          { flexGrow: 1, justifyContent: "space-between" },
          contentContainerStyle,
        ])}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Generic container for a screen with no scroll view.
 * @param param0
 */
export function PageViewNoScroll({
  children,
  ...props
}: React.ComponentProps<typeof SafeAreaView>) {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{
        ...styles.Page,
        ...styles.Container,
        backgroundColor: get_theme_color(theme, "background"),
      }}
    >
      {children}
    </SafeAreaView>
  );
}
