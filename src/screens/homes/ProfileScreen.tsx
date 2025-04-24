import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { View, TouchableOpacity, Modal, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles, { em, get_theme_color } from "styles/main_styles";
import { ScrollView } from "react-native-gesture-handler";
import { NormalText, TextButton } from "~/components/generic";
import { t } from "~/utility/utility";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "react-native-paper";

export default function ProfileScreen({
  navigation,
}: {
  navigation: any;
  route: any;
}) {
  const theme = useTheme();
  const isDarkTheme = theme.dark;
  const backgroundColor = isDarkTheme ? "#024B6D" : "#B6E8FF";
  const textColor = isDarkTheme ? "#B6E8FF" : "#024B6D";

  const { user } = useUser();
  const { signOut } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const formattedDate = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString()
    : "No date set";

  const handleSignOut = async () => {
    try {
      navigation.navigate("LoginNavigator");
      await signOut();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await user?.delete();
      navigation.navigate("LoginNavigator");
    } catch (e) {
      console.log(e);
    }
  };

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

  return (
    <SafeAreaView style={[styles.Page, { backgroundColor }]}>
      <View style={[styles.Container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Image
              source={{
                uri: user?.imageUrl || "https://via.placeholder.com/150",
              }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: get_theme_color(theme, "primary"),
              }}
            />
          </View>

          <View
            style={{
              marginTop: 20,
              marginBottom: 20,
              alignSelf: "center",
            }}
          >
            <Text
              style={[
                styles.label,
                {
                  color: textColor,
                  fontSize: 17,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>Name: </Text>
              {user?.fullName || "Not Set"}
            </Text>

            <Text
              style={[
                styles.label,
                {
                  color: textColor,
                  fontSize: 17,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>Email: </Text>
              {user?.primaryEmailAddress?.emailAddress || "Not Set"}
            </Text>

            <Text
              style={[
                styles.label,
                {
                  color: textColor,
                  fontSize: 17,
                },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>Last Updated: </Text>
              {formattedDate}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", marginTop: 20, alignSelf: "center" }}
          >
            <TextButton
              onPress={() => navigation.navigate("EditProfileScreen")}
              style={{ marginLeft: 10 }}
            >
              Edit Profile
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
