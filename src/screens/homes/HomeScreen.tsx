import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useTheme, Text as PaperText } from "react-native-paper";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { em, get_theme_color } from "styles/main_styles";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");
const baseFontSize = width > 400 ? 18 : 16;
const basePadding = width > 400 ? 24 : 16;

// Scaling functions for responsive layout
const scale = (size: number) => (width / 390) * size;
const verticalScale = (size: number) => (height / 844) * size;

/**
 * Instruction card component used for displaying onboarding steps.
 */
const InstructionCard = ({
  icon,
  title,
  description,
  bgColor,
  textColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}) => (
  <View style={[styles.card, { backgroundColor: bgColor }]}>
    <View style={styles.cardIcon}>{icon}</View>
    <View style={{ flex: 1 }}>
      <PaperText
        variant="titleSmall"
        style={[styles.cardTitle, { color: textColor }]}
      >
        {title}
      </PaperText>
      <PaperText
        variant="bodyMedium"
        style={[styles.cardText, { color: textColor }]}
      >
        {description}
      </PaperText>
    </View>
  </View>
);

/**
 * HomeScreen: Main screen of the app with app name, tagline, instructions, and profile navigation.
 */
export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const isDarkTheme = theme.dark;
  const primaryTextColor = isDarkTheme ? "#B6E8FF" : "#024B6D";
  const cardBgColor = isDarkTheme ? "#B6E8FF" : "#024B6D";
  const cardTextColor = isDarkTheme ? "#024B6D" : "#B6E8FF";

  return (
    <SafeAreaView style={styles.Page}>
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />

      {/* Profile button (top-right corner) */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ProfileScreen")}
        style={[styles.profileButton, { top: insets.top + 10 }]}
      >
        <Icon
          name="person-circle"
          size={2.5 * em}
          color={get_theme_color(theme, "onPrimaryContainer")}
        />
      </TouchableOpacity>

      {/* Main content */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          {/* App name */}
          <View style={styles.appNameContainer}>
            <PaperText
              variant="headlineMedium"
              style={[styles.appNameText, { color: "#FEC601" }]}
            >
              Scan
            </PaperText>
            <PaperText
              variant="headlineMedium"
              style={[styles.appNameText, { color: "#000" }]}
            >
              Avert
            </PaperText>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <PaperText
              variant="titleSmall"
              style={[styles.tagline, { color: primaryTextColor }]}
            >
              Your safety companion,
            </PaperText>
            <PaperText
              variant="titleSmall"
              style={[styles.tagline, { color: primaryTextColor }]}
            >
              Avoid harmful products with a few taps.
            </PaperText>
          </View>

          {/* How it works section */}
          <View style={styles.instructionsSection}>
            <PaperText
              variant="titleMedium"
              style={[styles.instructionsTitle, { color: primaryTextColor }]}
            >
              How it works:
            </PaperText>

            <InstructionCard
              icon={
                <FontAwesome5 name="search" size={24} color={cardTextColor} />
              }
              title="Search Smart"
              description="Look up any product using name or keywords."
              bgColor={cardBgColor}
              textColor={cardTextColor}
            />
            <InstructionCard
              icon={
                <FontAwesome5 name="barcode" size={24} color={cardTextColor} />
              }
              title="Scan Instantly"
              description="Point and scan barcodes to check recall status."
              bgColor={cardBgColor}
              textColor={cardTextColor}
            />
            <InstructionCard
              icon={
                <FontAwesome5 name="history" size={24} color={cardTextColor} />
              }
              title="Track History"
              description="Access and manage your previously scanned items."
              bgColor={cardBgColor}
              textColor={cardTextColor}
            />
            <InstructionCard
              icon={
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={26}
                  color={cardTextColor}
                />
              }
              title="Report Issues"
              description="Found a faulty product? Report it easily."
              bgColor={cardBgColor}
              textColor={cardTextColor}
            />
          </View>

          {/* Call to action */}
          <PaperText
            variant="bodyLarge"
            style={[styles.callToAction, { color: primaryTextColor }]}
          >
            Elevate your safety today!
          </PaperText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// Styles
const styles = StyleSheet.create({
  Page: {
    flex: 1,
  },
  profileButton: {
    position: "absolute",
    right: basePadding,
    zIndex: 10,
  },
  container: {
    paddingHorizontal: basePadding,
    paddingTop: basePadding * 1.5,
    paddingBottom: basePadding,
    alignItems: "center",
  },
  innerContent: {
    width: "100%",
    alignItems: "center",
  },
  appNameContainer: {
    flexDirection: "row",
    marginBottom: basePadding * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  appNameText: {
    fontWeight: "bold",
    fontSize: baseFontSize * 2,
  },
  taglineContainer: {
    marginBottom: basePadding,
    paddingHorizontal: basePadding,
    alignItems: "center",
  },
  tagline: {
    fontSize: baseFontSize,
    textAlign: "center",
    marginBottom: 4,
  },
  instructionsSection: {
    width: "100%",
    marginBottom: basePadding,
  },
  instructionsTitle: {
    fontWeight: "bold",
    fontSize: baseFontSize + 2,
    marginBottom: basePadding * 0.5,
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    padding: basePadding,
    marginBottom: basePadding,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardIcon: {
    marginRight: basePadding,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: baseFontSize,
  },
  cardText: {
    marginTop: 4,
    fontSize: baseFontSize - 2,
  },
  callToAction: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: baseFontSize + 2,
    marginTop: basePadding,
  },
});
