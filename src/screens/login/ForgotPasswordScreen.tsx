import React, { useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import {
  FTextInput,
  H2Text,
  NormalText,
  PageView,
  TextButton,
} from "~/components/generic";
import styles, { em } from "styles/main_styles";
import { useSignIn } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { log, error, t } from "~/utility/utility";
import { HelperText, Snackbar, TextInput } from "react-native-paper";

import type { StackNavigationProp } from '@react-navigation/stack';
import { LoginNavigatorParamList } from "~/navigators/login_navigator";

export type ForgotPasswordScreenNavigation = StackNavigationProp<LoginNavigatorParamList, 'ForgotPassword'>;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [codeSnackbar, setCodeSnackbar] = useState(false);
  const navigation = useNavigation<ForgotPasswordScreenNavigation>();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator animating={true} />
        <NormalText>{t("loading")}</NormalText>
      </SafeAreaView>
    );
  }

  async function create(e: any) {
    log("Sending reset password request.");
    e.preventDefault();
    try {
      if (signIn) {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        });
      }
      setSuccessfulCreation(true);
      setErrorMessage("");
    } catch (err: any) {
      error("error", err.errors[0].longMessage);
      setErrorMessage(err.errors[0].longMessage);
    }
  }

  async function reset(e: any) {
    //e.preventDefault();
    log("Trying to reset password");
    try {
      if (signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code,
          password,
        });
        log(result);
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setErrorMessage("");
        } else if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          setErrorMessage("");
          navigation.goBack();
        } else {
          log(result);
        }
      }
    } catch (err) {
      error("error", (err as any).errors[0].longMessage);
      setErrorMessage((err as any).errors[0].longMessage);
      setCodeSnackbar(true);
    }
  }

  return (
    <PageView contentContainerStyle={{ justifyContent: "center" } as any}>
      {!successfulCreation ? (
        <>
          <H2Text>{t("forgotpassword_hint")}</H2Text>
          <FTextInput
            label={t("email")}
            left={<TextInput.Icon icon="email" />}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          {errorMessage.length != 0 && (
            <HelperText type="error" style={{ color: "red", marginTop: 10 }}>
              {errorMessage}
            </HelperText>
          )}
          <TextButton
            onPress={create}
            style={{ alignSelf: "stretch", marginTop: em }}
          >
            {t("forgotpassword_reset")}
          </TextButton>
        </>
      ) : (
        <>
          <FTextInput
            label={t("forgotpassword_resetcode")}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <FTextInput
            left={<TextInput.Icon icon="lock" />}
            label={t("forgotpassword_newpassword")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <FTextInput
            left={<TextInput.Icon icon="lock" />}
            label={t("forgotpassword_newpasswordagain")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {password != confirmPassword && (
            <HelperText type="error">{t("signup_passwordnomatch")}</HelperText>
          )}
          <TextButton
            onPress={reset}
            disabled={password != confirmPassword || password.length == 0}
            style={{ alignSelf: "stretch", marginTop: em }}
          >
            {t("reset")}
          </TextButton>
          <Snackbar
            visible={codeSnackbar}
            onDismiss={() => {
              setCodeSnackbar(false);
            }}
            action={{
              label: t("dismiss"),
              onPress: () => {
                setCodeSnackbar(false);
              },
            }}
          >
            {errorMessage}
          </Snackbar>
        </>
      )}
      {secondFactor && <NormalText>{t("forgotpassword_no2fa")}</NormalText>}
    </PageView>
  );
}

export default ForgotPassword;
