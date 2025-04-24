import React, { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  View,
  Image,
  StyleSheet,
  Platform,
  ToastAndroid,
  Text,
} from "react-native";
import {
  FTextInput,
  NormalText,
  PageView,
  TextButton,
} from "~/components/generic";
import { get_theme_color } from "styles/main_styles";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { log, error, t, info } from "~/utility/utility";

export const IssueScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [Pname, setPname] = useState("");
  const [UPC, setUPC] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");

  const reportIssue = () => {
    if (Pname === "" || title === "" || description === "") {
      Platform.OS === "ios"
        ? alert("Please fill out all fields")
        : ToastAndroid.show("Please fill out both fields", ToastAndroid.SHORT);
    } else {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          let responseText = this.responseText;
          let data = JSON.parse(responseText);
          console.log(data);
          data = JSON.parse(data);
          if (data["Status"] === "CREATED") {
            Platform.OS === "ios"
              ? alert("Created")
              : ToastAndroid.show("Created", ToastAndroid.SHORT);
            navigation.navigate("Home");
          } else {
            Platform.OS === "ios"
              ? alert("Error Inputting Data")
              : ToastAndroid.show("Error Inputting", ToastAndroid.SHORT);
          }
        }
      };
      log("Issue reporting");
      xhttp.open(
        "POST",
        "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/InsertFoodIssue",
        true
      );
      xhttp.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      xhttp.send(`name=${Pname}&title=${title}&description=${description}`);
      navigation.goBack();
    }
  };

  return (
    <PageView>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <View style={{ paddingTop: 5, alignSelf: "center" }}>
          <Image
            source={require("assets/UrRecallsLogo.png")}
            style={{ width: 180, height: 140 }}
          />
        </View>
        <ScrollView>
          <NormalText>
            {t("issue_description")}
            {"\n"}
          </NormalText>
          <FTextInput
            placeholder="Title"
            returnKeyType="next"
            onChangeText={(text) => setTitle(text)}
          />
          <FTextInput
            placeholder="Product Name"
            returnKeyType="next"
            onChangeText={(text) => setPname(text)}
          />
          <FTextInput
            placeholder="Description of Issue"
            multiline={true}
            returnKeyType="next"
            onChangeText={(text) => setDescription(text)}
          />

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignSelf: "center",
              padding: 40,
            }}
          >
            <TextButton
              onPress={reportIssue}
              style={{
                backgroundColor: get_theme_color(theme, "secondaryContainer"),
              }}
            >
              <Text
                style={{
                  color: get_theme_color(theme, "onSecondaryContainer"),
                }}
              >
                {t("report_issue")}
              </Text>
            </TextButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageView>
  );
};
// export class IssueScreen extends Component {
//   constructor(props: any) {
//     super(props);

//     this.state = {
//       data: global.data as { [key: string]: any } | undefined,
//       Pname: "",
//       UPC: "",
//       description: "",
//       title: "",
//     };
//   }

//   //Handles updateing the username textfield
//   changedPname = (Pname: string) => {
//     this.setState({
//       Pname: Pname,
//     });
//   };
//   changedUPC = (UPC: string) => {
//     this.setState({
//       UPC: UPC,
//     });
//   };
//   //Handles updateing the password textfield
//   changedDescription = (description: string) => {
//     this.setState({
//       description: description,
//     });
//   };
//   changedTitle = (title: string) => {
//     this.setState({
//       title: title,
//     });
//   };

//   reportIssue = () => {
//     const { Pname } = this.state as { Pname: string };
//     const { UPC } = this.state as { UPC: string };

//     const { title } = this.state as { title: string };
//     const { description } = this.state as { description: string };
//     const { id } = this.state as { id: string };
//     var state = store.getState().userID;

//     const { navigate } = this.props.navigation;
//     if (Pname === "" || UPC === "" || title === "" || description === "") {
//       Platform.OS === "ios"
//         ? alert("Please fill out all fields")
//         : ToastAndroid.show("Please fill out both fields", ToastAndroid.SHORT);
//     } else {
//       var xhttp = new XMLHttpRequest();
//       xhttp.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//           var data = this.responseText;
//           console.log(data);
//           data = JSON.parse(data);
//           if (data["Status"] === "CREATED") {
//             Platform.OS === "ios"
//               ? alert("Created")
//               : ToastAndroid.show("Created", ToastAndroid.SHORT);
//             navigate("Home");
//           } else {
//             Platform.OS === "ios"
//               ? alert("Error Inputting Data")
//               : ToastAndroid.show("Error Inputting", ToastAndroid.SHORT);
//           }
//         }
//       };
//       xhttp.open(
//         "POST",
//         "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/InsertGoodsIssue",
//         true
//       );
//       xhttp.setRequestHeader(
//         "Content-type",
//         "application/x-www-form-urlencoded"
//       );
//       xhttp.send(
//         `name=${Pname}&title=${title}&UPC=${UPC}&description=${description}&user_id=${state}`
//       );
//     }
//   };
//   render() {
//     return (
//       <View style={styles.container}>
//         <KeyboardAvoidingView style={{ flex: 1 }}>
//           <View style={styles.rectangle27}>
//             <Image
//               source={require("assets/UrRecallsLogo.png")}
//               style={{ width: 180, height: 140 }}
//             />
//           </View>
//           <ScrollView>
//             <Text style={styles.text}>
//               (t{"issue_description"}){"\n"}
//             </Text>
//             <TextInput
//               style={styles.rectangle17}
//               placeholder="Product Name"
//               returnKeyType="next"
//               onChangeText={this.changedPname}
//             />
//             <Text> </Text>
//             <TextInput
//               style={styles.rectangle17}
//               placeholder="UPC"
//               returnKeyType="next"
//               onChangeText={this.changedUPC}
//             />
//             <Text> </Text>
//             <TextInput
//               style={styles.rectangle17}
//               placeholder="Description of Issue"
//               returnKeyType="next"
//               onChangeText={this.changedDescription}
//             />
//             <Text> </Text>
//             <TextInput
//               style={styles.rectangle17}
//               placeholder="Title"
//               returnKeyType="next"
//               onChangeText={this.changedTitle}
//             />

//             <View style={{ padding: 40 }}>
//               <Button
//                 onPress={this.reportIssue}
//                 title="Report Issue"
//                 color="#bbd753"
//               />
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </View>
//     );
//   }
// }

const styles = StyleSheet.create({
  rectangle27: {
    width: "100%",
    height: 150,
    paddingTop: 5,
    backgroundColor: "#d9dde2",
    justifyContent: "center",
    borderBottomWidth: 4,
    alignItems: "center",
    borderBottomColor: "transparent",
  },
  rectangle1: {
    width: "100%",
    height: 812,
    backgroundColor: "#0e729e",
  },
  // rectangle17: {
  //   width: 236,
  //   height: 34,
  //   color: "#bbd753",
  //   alignSelf: "center",
  //   fontSize: 20,
  //   borderBottomColor: "#bbb",
  //   borderBottomWidth: StyleSheet.hairlineWidth,
  //   paddingTop: 3,
  // },
  text: {
    paddingTop: 10,
    paddingBottom: 20,
    left: 5,
    color: "#d9dde2",
    fontSize: 14,
    flexWrap: "wrap",
    fontWeight: "700",
    letterSpacing: 1.25,
    alignSelf: "center",
    borderBottomWidth: 5,
    borderBottomColor: "transparent",
    width: "85%",
  },
  rectangle14: {
    width: 214,
    height: 37,
    backgroundColor: "#ffe308",
    padding: 3,
  },
  rectangle7: {
    width: 375,
    height: 72,
    borderRadius: 2,
    backgroundColor: "#ffdd00",
  },
  Text2: {
    fontSize: 18,
    color: "white",
    marginRight: 10,
  },
  SignUpText: {
    fontSize: 25,
    color: "#ffdd00",
    marginRight: 10,
  },
  container: {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    marginTop: 0,
    borderColor: "#707070",
    borderStyle: "solid",
    paddingTop: 0,
    borderWidth: 1,
    backgroundColor: "#0e729e",
  },
});
