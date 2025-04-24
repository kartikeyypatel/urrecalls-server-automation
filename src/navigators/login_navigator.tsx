import React from "react";
import { SignedOut } from "@clerk/clerk-expo";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "../screens/login/SignInScreen"; // Adjusted path
import SignUpScreen from "../screens/login/SignUpScreen"; // Adjusted path
import TermsAndConditions from "../screens/login/TermsConditionsScreen"; // Adjusted path
import ForgotPassword from "../screens/login/ForgotPasswordScreen"; // Adjusted path



// Define ParamList specifically for this navigator
export type LoginNavigatorParamList = {
  Login: undefined;
  Signup: undefined;
  Terms: { acceptance_callback: (e: void) => void };
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<LoginNavigatorParamList>();

function LoginNavigator() {
  return (
    <SignedOut>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={SignInScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="Terms" component={TermsAndConditions} />
        <Stack.Screen
          options={{ headerShown: true, title: "" }}
          name="ForgotPassword"
          component={ForgotPassword}
        />
      </Stack.Navigator>
    </SignedOut>
  );
}

export default LoginNavigator;
