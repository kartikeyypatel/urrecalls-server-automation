import React, { Component } from "react";
import {
  Button,
  Picker,
  Text,
  KeyboardAvoidingView,
  View,
  Image,
  StyleSheet,
  TextInput,
  ToastAndroid,
  Platform,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { white } from "ansi-colors";
import store from "../../store";

export default class SignupScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: global.data,
      Pname: "",
      UPC: "",
      description: "",
      title: "",
    };
  }

  //Handles updateing the username textfield
  changedPname = (Pname) => {
    this.setState({
      Pname: Pname,
    });
  };
  changedUPC = (UPC) => {
    this.setState({
      UPC: UPC,
    });
  };
  //Handles updateing the password textfield
  changedDescription = (description) => {
    this.setState({
      description: description,
    });
  };
  changedTitle = (title) => {
    this.setState({
      title: title,
    });
  };

  reportIssue = () => {
    const { Pname } = this.state;
    const { UPC } = this.state;

    const { title } = this.state;
    const { description } = this.state;
    const { id } = this.state.data;
    var state = store.getState().userID;

    const { navigate } = this.props.navigation;
    if (Pname === "" || UPC === "" || title === "" || description === "") {
      Platform.OS === "ios"
        ? alert("Please fill out all fields")
        : ToastAndroid.show("Please fill out both fields", ToastAndroid.SHORT);
    } else {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var data = this.responseText;
          console.log(data);
          data = JSON.parse(data);
          if (data["Status"] === "CREATED") {
            Platform.OS === "ios"
              ? alert("Created")
              : ToastAndroid.show("Created", ToastAndroid.SHORT);
            navigate("Home");
          } else {
            Platform.OS === "ios"
              ? alert("Error Inputting Data")
              : ToastAndroid.show("Error Inputting", ToastAndroid.SHORT);
          }
        }
      };
      xhttp.open(
        "POST",
        "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/InsertFoodIssue",
        true
      );
      xhttp.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      xhttp.send(
        `name=${Pname}&title=${title}&UPC=${UPC}&description=${description}&user_id=${state}`
      );
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : null}
          enabled
        >
          <View style={styles.rectangle27}>
            <Image
              source={require("assets/UrRecallsLogo.png")}
              style={{ width: 180, height: 140 }}
            />
          </View>
          <ScrollView>
            <Text style={styles.text}>
              This is the food issue page. Here you can submit personal problems
              you had with a product. Enter the values below as well as anything
              else you would like to share about your experience with the
              product.{"\n"}
            </Text>
            <TextInput
              style={styles.rectangle17}
              placeholder="Product Name"
              returnKeyType="next"
              onChangeText={this.changedPname}
            />
            <Text> </Text>
            <TextInput
              style={styles.rectangle17}
              placeholder="UPC"
              returnKeyType="next"
              onChangeText={this.changedUPC}
            />
            <Text> </Text>
            <TextInput
              style={styles.rectangle17}
              placeholder="Description of Issue"
              returnKeyType="next"
              onChangeText={this.changedDescription}
            />
            <Text> </Text>
            <TextInput
              style={styles.rectangle17}
              placeholder="Title"
              returnKeyType="next"
              onChangeText={this.changedTitle}
            />
            <View style={{ padding: 40 }}>
              <Button
                onPress={this.reportIssue}
                title="Report Issue"
                color="#bbd753"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

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
  rectangle17: {
    width: 236,
    height: 34,
    color: "#bbd753",
    alignSelf: "center",
    fontSize: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
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
    paddingTop: 3,
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
