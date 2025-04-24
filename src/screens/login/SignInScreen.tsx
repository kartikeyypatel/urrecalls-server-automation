import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { useSignIn } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { error, log, t } from '~/utility/utility';
import { TextInput, withTheme, useTheme, Checkbox } from 'react-native-paper';
import { em, get_theme_color } from 'styles/main_styles';
import { FTextInput, H2Text, Logo, NormalText, PageView, TextButton, Touchable } from '~/components/generic';

import type { StackNavigationProp } from '@react-navigation/stack';
import { LoginNavigatorParamList } from "~/navigators/login_navigator";

export type LoginScreenNavigation = StackNavigationProp<LoginNavigatorParamList, "Login">;

function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState(process.env.DEFAULT_USERNAME ?? '');
  const [password, setPassword] = useState(process.env.DEFAULT_PASSWORD ?? '');
  const [rememberMe, setRememberMe] = useState(false);

  const theme = useTheme();
  // Dynamically set colors based on theme
  const isDarkTheme = theme.dark;
  const backgroundColor = isDarkTheme ? "#024B6D" : "#B6E8FF";
  const textColor = isDarkTheme ? "#B6E8FF" : "#024B6D";

  const navigation = useNavigation<LoginScreenNavigation>();

  log(`Default username: ${process.env.DEFAULT_USERNAME}`);

  /**
   * Clerk Expo signin process.
   * https://clerk.com/docs/quickstarts/expo#build-your-sign-in
   */
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress.trim(),  //  emails shouldn't have leading or trailing white space
        password,
      });
      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
      // navigation.navigate("MainNavigator", {
      //   screen: "FoodsScreen",
      //   params: undefined
      //  });
    } catch (err: any) {
      alert(err.errors[0].longMessage);
      error(err);
    }
  };

  // Clear the "<replace>" value
  const handleEmailFocus = () => {
    if (emailAddress === "<replace>") setEmailAddress("");
  };
  const handlePasswordFocus = () => {
    if (password === "<replace>") setPassword("");
  };

  return (
    <PageView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled
        keyboardVerticalOffset={Platform.select({
          ios: 80,
          android: 100,
        })}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.container}>
          <Logo />
          <H2Text style={[styles.headerText, { color: textColor }]}>Login to UrRecalls</H2Text>
          <NormalText style={styles.subText}>{t('signin_text')}</NormalText>

          <FTextInput
            left={<TextInput.Icon icon="email" />}
            label={t('email')}
            value={emailAddress}
            keyboardType="email-address"
            onChangeText={setEmailAddress}
            onFocus={handleEmailFocus}
            style={styles.input}
          />

          <FTextInput
            left={<TextInput.Icon icon="lock" />}
            label={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={handlePasswordFocus}
            style={styles.input}
          />

          {/* Remember Me */}
          <View style={styles.rememberMeContainer}>
            <View
              style={[
                styles.checkboxWrapper,
                { borderColor: get_theme_color(theme, 'onSurfaceVariant') },
              ]}
            >
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={get_theme_color(theme, 'primary')}
                uncheckedColor={get_theme_color(theme, 'onSurfaceVariant')}
              />
            </View>
            <NormalText
              style={styles.rememberText}
              text="Remember Me"
            />
          </View>

          <TextButton
            icon="login"
            style={[styles.signInButton, { backgroundColor: textColor }]}
            onPress={onSignInPress}
          >
            <NormalText style={{ color: get_theme_color(theme, 'onPrimary') }}>
              {t('signin_signin').toUpperCase()}
            </NormalText>
          </TextButton>

          <Touchable
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <NormalText
              style={{
                color: get_theme_color(theme, 'onSurfaceVariant'),
              }}
            >
              {t('signin_forgot')}
            </NormalText>
          </Touchable>
        </View>

        <View style={styles.signupContainer}>
          <NormalText style={styles.signupPrompt}>
            {t('signin_notmember') + ' '}
          </NormalText>
          <Touchable onPress={() => navigation.navigate('Signup')}>
            <NormalText
              style={[
                styles.signupLink,
                { color: textColor },
              ]}
            >
              {t('signin_signup')}
            </NormalText>
          </Touchable>
        </View>
      </KeyboardAvoidingView>
    </PageView>
  );
}

export default withTheme(SignInScreen);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: em,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    marginBottom: 0,
  },
  subText: {
    marginBottom: 2 * em,
  },
  input: {
    marginTop: 0,
    marginBottom: 0,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: em * 0.8,
  },
  checkboxWrapper: {
    transform: [{ scale: 0.6 }],
    borderWidth: 1,
    borderRadius: 3,
    padding: 1,
    marginRight: 8,
  },
  rememberText: {
    marginTop: 8,
  },
  signInButton: {
    marginTop: em,
    alignSelf: 'stretch',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: em,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2 * em,
  },
  signupPrompt: {
    display: 'flex',
  },
  signupLink: {
    fontWeight: 'bold',
  },
});