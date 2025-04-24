import { ExpoConfig, ConfigContext } from "expo/config";

//  https://docs.expo.dev/workflow/configuration/
export default ({ config }: ConfigContext): ExpoConfig => {
  // Environment variables or any logic to dynamically set the config
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;

  return {
    name: "UrRecalls",
    slug: "urrecalls",
    version: "1.0.0",
    assetBundlePatterns: ["*/"],
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.wantley.UrRecalls",
    },
    android: {
      package: "com.wantley.UrRecalls",
      jsEngine: "hermes",
    },
    extra: {
      clerkPublishableKey,
      eas: {
        projectId: "9084d5b2-1427-44f2-90f9-36b54d0d52e2",
      },
    },
    plugins: [
      "expo-secure-store",
      "expo-localization",
    ],
  };
};