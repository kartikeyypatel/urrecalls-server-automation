import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { View, TouchableOpacity, Modal, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles, { get_theme_color } from "styles/main_styles";
import { FTextInput, NormalText, TextButton } from "~/components/generic";
import { Text } from "react-native";
import { t } from "~/utility/utility";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

export default function ProfileEditScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const isDarkTheme = theme.dark;
  const backgroundColor = isDarkTheme ? "#024B6D" : "#B6E8FF";
  const textColor = isDarkTheme ? "#B6E8FF" : "#024B6D";

  const { user } = useUser();
  const { signOut } = useAuth();

  // Default values for user information
  //   const defaultProfilePic = user?.profileImageUrl || "";
  const defaultProfilePic = user?.imageUrl || "";
  const defaultName = user?.firstName || "";
  const defaultEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  //   const defaultEmail = user?.emailAddresses?.[0]?.email || "";
  //   const defaultEmail = user?.emailAddresses?.[0]?.address || "";
  //   const defaultEmail = user?.emailAddresses?.[0]?.email || "";
  //   const defaultEmail = user?.email_addresses?.[0]?.email || "";
  //   const defaultEmail = user?.primaryEmailAddress?.emailAddress || "";
  //   const defaultEmail = user?.primaryEmailAddress?.email || "";

  //   const defaultUsername = user?.username || "";
  //   const defaultPhone = user?.phoneNumber || "";
  //   const defaultPhone = user?.phoneNumbers?.[0]?.phoneNumber || "";

  // States for profile and password update
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  //   const [username, setUsername] = useState(defaultUsername);
  //   const [phone, setPhone] = useState(defaultPhone);
  //   const [username, setUsername] = useState<string>(user?.username || "");
  //   const [phone, setPhone] = useState<string>(
  //     user?.primaryPhoneNumber?.phoneNumber || ""
  //   );
  const [newClerkPassword, setNewClerkPassword] = useState("");
  const [newClerkPasswordConfirm, setNewClerkPasswordConfirm] = useState("");
  const [currentClerkPassword, setCurrentClerkPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  // States to hold error messages
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isNameValid, setIsNameValid] = useState(true);

  // Name validation function
  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces allowed
    return nameRegex.test(name);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    // Example: Password should have at least 8 characters, including a number and a special character
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle modal visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Open image picker to update profile picture
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri); // Set the new profile picture URI
    }
  };

  // Settings modal for logout and delete account
  const SettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={toggleModal}
    >
      <View
        style={{
          marginTop: 22,
          margin: 20,
          backgroundColor: get_theme_color(theme, "primaryContainer"),
          borderRadius: 20,
          padding: 35,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <TextButton
          onPress={handleSignOut}
          style={{ marginBottom: 20, alignSelf: "center" }}
        >
          Logout
        </TextButton>
        <TextButton
          onPress={handleDeleteAccount}
          style={{
            marginBottom: 20,
            alignSelf: "center",
            backgroundColor: "red",
          }}
        >
          Delete Account
        </TextButton>
        <TextButton onPress={toggleModal} style={{ alignSelf: "center" }}>
          Close
        </TextButton>
      </View>
    </Modal>
  );

  // Update profile function
  //   const handleUpdateProfile = async () => {
  //     try {
  //       // Update the name, email, and profile picture if changed
  //       await user?.update({
  //         // await user?.updateProfile({
  //         firstName: name,
  //         primaryEmailAddressId: user?.primaryEmailAddressId || undefined,
  //         // primaryEmailAddress: email,
  //         // primaryEmailAddress: emailAddress,
  //         // username: username,
  //         // primaryPhoneNumberId: user?.primaryPhoneNumberId || undefined,
  //         // phoneNumber: phone,
  //         // profileImageUrl: profilePic,
  //         // profileImageUrl: profilePic || "",
  //         // imageUrl: profilePic || "",
  //       });

  //       // Update profile picture if provided
  //       if (profilePic) {
  //         // Use the setProfileImage method to update the profile picture
  //         await user?.setProfileImage({ file: profilePic });
  //       }

  //       // Update password if provided
  //       if (newClerkPassword && newClerkPassword === newClerkPasswordConfirm) {
  //         await user?.updatePassword({
  //           currentPassword: currentClerkPassword,
  //           newPassword: newClerkPassword,
  //           signOutOfOtherSessions: true,
  //         });
  //         console.log("Password updated!");
  //       }

  //       console.log("Profile updated!");
  //       // Show success or navigate away after updating
  //       navigation.navigate("ProfileScreen");
  //     } catch (error) {
  //       console.log("Error updating profile:", error);
  //     }
  //   };

  const handleUpdateProfile = async () => {
    let hasError = false;

    // Validate name
    if (name.trim() === "") {
      setNameError("Name cannot be empty.");
      setIsNameValid(false); // Name is invalid
      hasError = true;
    } else if (!validateName(name)) {
      setNameError("Name can only contain letters and spaces.");
      setIsNameValid(false); // Name is invalid
      hasError = true;
    } else {
      setNameError(null); // Clear error if valid
      setIsNameValid(true); // Name is valid
    }

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError(null); // Clear error if valid
    }

    // Validate password
    if (newClerkPassword && !validatePassword(newClerkPassword)) {
      setPasswordError(
        "Password must be at least 8 characters, include a number, and a special character."
      );
      hasError = true;
    } else {
      setPasswordError(null);
    }

    // Confirm password match
    if (newClerkPassword !== newClerkPasswordConfirm) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    // If there are validation errors, return early
    if (hasError) return;

    // If no errors, proceed with the update
    try {
      // Update the name, email, and profile picture if changed
      await user?.update({
        firstName: name,
        primaryEmailAddressId: user?.primaryEmailAddressId || undefined,
      });

      if (profilePic) {
        await user?.setProfileImage({ file: profilePic });
      }

      // Update password if provided
      if (newClerkPassword && newClerkPassword === newClerkPasswordConfirm) {
        await user?.updatePassword({
          currentPassword: currentClerkPassword,
          newPassword: newClerkPassword,
          signOutOfOtherSessions: true,
        });
        console.log("Password updated!");
      }

      console.log("Profile updated!");
      navigation.navigate("ProfileScreen");
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  };

  // Format date from clerk
  const formattedDate = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString()
    : "No date set";

  // Delete account function
  const handleDeleteAccount = async () => {
    try {
      await user?.delete();
      navigation.navigate("LoginNavigator");
    } catch (error) {
      console.log("Error deleting account:", error);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      navigation.navigate("LoginNavigator");
      await signOut();
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.Page, { backgroundColor }]}>
      <View style={[styles.Container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {/* Profile Picture */}
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{
                  uri: profilePic || "https://via.placeholder.com/150",
                }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 3,
                  borderColor: get_theme_color(theme, "primary"),
                }}
              />
              <Icon
                name="pencil"
                size={24}
                color={get_theme_color(theme, "primary")}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 4,
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Name Input with Validation */}
          <FTextInput
            label={t("profile_name", { defaultValue: "Name" })}
            value={name}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              setName(text);
              const isValid = validateName(text); // Validate the name
              setIsNameValid(isValid); // Set name validity
              if (!isValid) {
                setNameError("Name can only contain letters and spaces.");
              } else {
                setNameError(null); // Clear error if name is valid
              }
            }}
          />

          {/* Display the error message if validation fails */}
          {!isNameValid && nameError && (
            <Text style={{ color: "red", marginTop: 5 }}>{nameError}</Text>
          )}
          {/* <FTextInput
            label={t("profile_name", { defaultValue: "Name" })}
            value={name}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Name changed:", text); // Log when the text changes
              setName(text);
            }}
          /> */}

          {/* Email Input with Validation */}
          <FTextInput
            label="Email"
            value={email}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null); // Clear error on text change
            }}
          />
          {emailError && (
            <Text style={{ color: "red", marginBottom: 10 }}>{emailError}</Text>
          )}

          {/* <FTextInput
            label="Email"
            value={email}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Email changed:", text); // Log when the text changes
              setEmail(text);
            }}
          /> */}
          {/* <FTextInput
            label={t("profile_username", { defaultValue: "Username" })}
            value={username}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Username changed:", text); // Log when the text changes
              setUsername(text);
            }}
          /> */}
          {/* <FTextInput
            label={t("profile_phone", { defaultValue: "Phone" })}
            value={phone}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Phone number changed:", text); // Log when the text changes
              setPhone(text);
            }}
            keyboardType="phone-pad"
          /> */}

          {/* Password Reset Section */}
          <Text
            style={{
              marginTop: 30,
              marginBottom: 10,
              fontSize: 18,
              fontWeight: "bold",
              color: get_theme_color(theme, "onBackground"),
            }}
          >
            Reset Password
          </Text>

          {/* Current Password Input */}
          {/* <FTextInput
            label={t("profile_currentpassword", {
              defaultValue: "Current Password",
            })}
            value={currentClerkPassword}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Current Password changed:", text); // Log when the text changes
              setCurrentClerkPassword(text);
            }}
            secureTextEntry={true}
          /> */}

          {/* New Password Input with Validation */}
          <FTextInput
            label="New Password"
            value={newClerkPassword}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              setNewClerkPassword(text);
              setPasswordError(null); // Clear error on text change
            }}
            secureTextEntry={true}
          />
          {passwordError && (
            <Text style={{ color: "red", marginBottom: 10 }}>
              {passwordError}
            </Text>
          )}

          {/* Confirm New Password Input with Validation */}
          <FTextInput
            label="Confirm New Password"
            value={newClerkPasswordConfirm}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              setNewClerkPasswordConfirm(text);
              setConfirmPasswordError(null); // Clear error on text change
            }}
            secureTextEntry={true}
          />
          {confirmPasswordError && (
            <Text style={{ color: "red", marginBottom: 10 }}>
              {confirmPasswordError}
            </Text>
          )}

          {/* <FTextInput
            label={t("forgotpassword_newpassword", {
              defaultValue: "New Password",
            })}
            value={newClerkPassword}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("New Password changed:", text); // Log when the text changes
              setNewClerkPassword(text);
            }}
            secureTextEntry={true}
          />
          <FTextInput
            label={t("forgotpassword_newpasswordagain", {
              defaultValue: "Confirm New Password",
            })}
            value={newClerkPasswordConfirm}
            style={{ color: get_theme_color(theme, "onBackground") }}
            onChangeText={(text) => {
              console.log("Confirm New Password changed:", text); // Log when the text changes
              setNewClerkPasswordConfirm(text);
            }}
            secureTextEntry={true}
            mode="outlined"
          /> */}
          <View
            style={{
              marginTop: 10,
              marginBottom: 20,
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            {/* <NormalText>{`${t("profile_email", { email: email })}`}</NormalText> */}
            <NormalText
              style={{
                color: get_theme_color(theme, "onBackground"),
              }}
            ></NormalText>
            <NormalText>
              {t("profile_lastupdated", { date: formattedDate })}
            </NormalText>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              alignSelf: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <TextButton onPress={handleUpdateProfile}>
              {t("profile_updateprofile", { defaultValue: "Update Profile" })}
            </TextButton>
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity
        onPress={toggleModal}
        style={{
          position: "absolute",
          right: 20,
          top: 20,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: get_theme_color(theme, "primaryContainer"),
          borderRadius: 20,
        }}
      >
        <Icon
          name="cog"
          size={20}
          color={get_theme_color(theme, "onPrimaryContainer")}
        />
      </TouchableOpacity>

      <SettingsModal />
    </SafeAreaView>
  );
}
