import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { TextInput, useTheme, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { error, log, t } from "~/utility/utility";
import { SafeAreaView } from "react-native-safe-area-context";
import { em, get_theme_color } from "styles/main_styles";
import {
  FTextInput,
  H2Text,
  NormalText,
  StatefulButton,
  TextButton,
  Touchable,
} from "~/components/generic";

import type { StackNavigationProp } from "@react-navigation/stack";
import { LoginNavigatorParamList } from "~/navigators/login_navigator";

export type SignupScreenNavigation = StackNavigationProp<
  LoginNavigatorParamList,
  "Signup"
>;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassError, setShowPassError] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const theme = useTheme();

  // Dynamically set colors based on theme
  const isDarkTheme = theme.dark;
  const backgroundColor = isDarkTheme ? "#024B6D" : "#B6E8FF";
  const textColor = isDarkTheme ? "#B6E8FF" : "#024B6D";

  const navigation = useNavigation<SignupScreenNavigation>();

  useEffect(() => {
    setShowPassError(password !== confirmPassword);
  }, [confirmPassword, password]);


  const handleChangedPass = (text: string) => setConfirmPassword(text);

  // start the sign up process.
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    if (!agreedTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }
    if (!showPassError && agreedTerms) {
      try {
        await signUp.create({
          emailAddress: emailAddress.trim(), //  email addresses cannot have leading or trailign white space
          password,
        });

        // send the email.
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // change the UI to our pending section.
        setPendingVerification(true);
      } catch (err: any) {
        alert(err.errors[0].longMessage);
        error(JSON.stringify(err, null, 2));
      }
    }
  };

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      //navigation.navigate("MainNavigator", {
      // screen: "FoodsScreen",
      // params: undefined
      // });
    } catch (err: any) {
      alert(err.errors[0].longMessage);
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <SafeAreaView style={[styles.page, { backgroundColor }]}>
      <View style={styles.container}>
        <View>
        <H2Text style={[styles.title, { color: textColor }]}>{t("signup_createaccount")}</H2Text>

          {!pendingVerification && (
            <>
              <FTextInput
                left={<TextInput.Icon icon="email" />}
                label={t("email")}
                value={emailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
              />
              <FTextInput
                left={<TextInput.Icon icon="lock" />}
                value={password}
                label={t("password")}
                secureTextEntry
                onChangeText={setPassword}
              />
              <FTextInput
                left={<TextInput.Icon icon="lock" />}
                value={confirmPassword}
                label={t("confirmpassword")}
                secureTextEntry
                onChangeText={handleChangedPass}
              />
              {showPassError && (
                <HelperText type="error">{t("signup_passwordnomatch")}</HelperText>
              )}

              {/* Terms and Conditions */}
              <View style={styles.termsRow}>
                <StatefulButton
                  active_icon="check-bold"
                  inactive_icon="checkbox-blank-circle-outline"
                  status={agreedTerms ? "checked" : "unchecked"}
                  onPress={() => setAgreedTerms(!agreedTerms)}
                  style={styles.termsCheckbox}
                />
                <View style={styles.termsTextWrap}>
                  <Touchable
                    onPress={() =>
                      navigation.navigate("Terms", {
                        acceptance_callback: () => setAgreedTerms(true),
                      })
                    }
                  >
                    <NormalText style={styles.termsText}>
                      {t("signup_disclaimer") + " "}
                      <NormalText
                        style={{ color: get_theme_color(theme, "primary") }}
                      >
                        {t("signup_termsandconditions")}
                      </NormalText>
                    </NormalText>
                  </Touchable>
                </View>
              </View>

              <TextButton
                icon="login"
                style={styles.signupButton}
                onPress={onSignUpPress}
                disabled={
                  !agreedTerms ||
                  password !== confirmPassword ||
                  password.length === 0 ||
                  emailAddress.length === 0
                }
              >
                <NormalText style={{ color: get_theme_color(theme, "onPrimary") }}>
                  {t("signin_signup").toUpperCase()}
                </NormalText>
              </TextButton>
            </>
          )}

          {pendingVerification && (
            <>
              <FTextInput
                style={styles.codeInput}
                keyboardType="numeric"
                value={code}
                label={t("signup_code")}
                onChangeText={setCode}
              />
              <View style={styles.verifyBtnWrap}>
                <TextButton onPress={onPressVerify}>
                  <NormalText style={{ color: get_theme_color(theme, "onPrimary") }}>
                    {t("submit").toUpperCase()}
                  </NormalText>
                </TextButton>
              </View>
            </>
          )}
        </View>

        {!pendingVerification && (
          <View style={styles.footer}>
            <NormalText>{t("signup_alreadyhaveaccount") + " "}</NormalText>
            <Touchable onPress={() => navigation.goBack()}>
              <NormalText style={[styles.signInLink, { color: textColor }]}>
                {t("signup_signin")}
              </NormalText>
            </Touchable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: em,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 2 * em,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: em,
  },
  termsCheckbox: {
    alignSelf: "center",
    marginRight: em * 0.5,
  },
  termsTextWrap: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  termsText: {
    marginTop: em,
  },
  signupButton: {
    marginTop: 2 * em,
    alignSelf: "stretch",
  },
  codeInput: {
    marginBottom: 2 * em,
  },
  verifyBtnWrap: {
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 2 * em,
  },
  signInLink: {
    fontWeight: "bold",
  },
});