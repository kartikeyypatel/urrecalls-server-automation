import React from "react";
// Navigation Imports
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { SignedIn } from "@clerk/clerk-expo";
// Icon Libraries
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
// Utilities
import { t } from "~/utility/utility"; // Assuming this path is correct

// --- Import Screens ---
import { HomeScreen } from "~/screens/homes/HomeScreen";
// import { SearchScreen } from "~/screens/search/index"; // Assuming FoodsScreen replaced this?
import BarcodeScreen from "~/screens/food/Barcode";
import { SavedScreen } from "~/screens/homes/SavedScreen";
import FoodDetails from "~/screens/food/FoodDetails";
import FoodsScreen from "~/screens/food/FoodsScreen"; // Used for Search tab
// import DrugsScreen from "~/screens/drug/DrugsScreen"; // Not used in tabs/stack?
import ProfileScreen from "~/screens/homes/ProfileScreen";
import DrugDetails from "~/screens/drug/DrugDetails";
import EditProfileScreen from "~/screens/homes/EditProfileScreen";
// Report Flow Screens
import ReportIncidentScreen from "~/screens/report/ReportIncidentScreen";
import MedicalHistoryScreen from "~/screens/report/MedicalHistoryScreen";
import ReviewSubmitScreen from "~/screens/report/ReviewSubmitScreen";

// --- Import Types ---
// Import the updated types from your types file
import type {
    RootStackParamList, // Use the name defined in types.ts
    ReportIncidentState, // Needed for MedicalHistory params
    CombinedFormsData    // Needed for ReviewSubmit params
} from "./types"; // Assuming types.ts is in the same directory

// --- Define Tab Param List --- (Keep this if used by MainStack function)
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Barcode: undefined;
  History: undefined;
  Report: undefined;
};

// --- Create Navigators ---
// Use the updated RootStackParamList for the Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createMaterialBottomTabNavigator<MainTabParamList>();

// --- Bottom Tab Navigation Component ---
// This component defines the tabs themselves
function MainTabs() { // Renamed component for clarity
  return (
    <Tab.Navigator
      initialRouteName="Home"
      labeled={true}
      backBehavior="initialRoute"
      // Add active/inactive color props if desired
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={FoodsScreen} // Assuming FoodsScreen is the search entry point
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="search" color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen
        name="Barcode"
        component={BarcodeScreen}
        options={{
          tabBarLabel: "Scan",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="barcode" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={SavedScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="history" color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen
        // Note: This tab directly shows ReportIncidentScreen.
        // If a user navigates away and back, they might lose progress
        // unless you implement state persistence or pass data back.
        name="Report"
        component={ReportIncidentScreen} // The first screen of the report flow
        options={{
          tabBarLabel: "Report",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="notebook-edit-outline"
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- Main Stack Navigator ---
// Wraps the bottom tabs and includes screens outside the tab bar (like details, subsequent report screens)
function MainNavigator() {
  return (
    <SignedIn>
      {/* Use the Stack navigator defined with RootStackParamList */}
      <Stack.Navigator
        initialRouteName="Home" // Refers to the screen name in the Stack navigator
        screenOptions={{ headerTitleAlign: "center" }}
      >
        {/* The 'Home' screen in the Stack renders the entire Tab navigator */}
        <Stack.Screen
          name="Home" // This name MUST match a key in RootStackParamList if defined there, or be implicitly added
          component={MainTabs} // Render the Tab navigator component
          options={{ headerShown: false }} // Hide the Stack header for the tab screen
        />
        {/* Other screens pushed onto the Stack */}
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ title: t("Profile_title") }} // Assuming t() handles translation
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ title: "Edit Profile" }}
        />
        {/* Screens for the report flow */}
        <Stack.Screen
          name="ReportIncident" // This screen is also reachable via the 'Report' tab
          component={ReportIncidentScreen}
          options={{ title: "Report Incident" }} // Use static title or t()
        />
        <Stack.Screen
          name="MedicalHistory" // Navigated to from ReportIncidentScreen
          component={MedicalHistoryScreen}
          options={{ title: "Problem & History" }} // Use static title or t()
        />
        <Stack.Screen
          name="ReviewSubmit" // Navigated to from MedicalHistoryScreen
          component={ReviewSubmitScreen}
          options={{ title: "Review & Submit" }} // Use static title or t()
        />

        {/* Standalone Screens */}
        <Stack.Screen
          name="FoodDetails"
          component={FoodDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DrugDetails"
          component={DrugDetails}
          options={{ headerShown: false }}
        />
        {/* Add Barcode and History here if they should also be pushable stack screens */}
         {/* <Stack.Screen name="Barcode" component={BarcodeScreen} /> */}
         {/* <Stack.Screen name="History" component={SavedScreen} /> */}

      </Stack.Navigator>
    </SignedIn>
  );
}

export default MainNavigator;
