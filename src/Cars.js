import React, {Component} from "react";
import { Button, Text,KeyboardAvoidingView, 
  ToastAndroid, Platform ,View,Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";


  
export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      make: "",
      model:"",
      year:"",
    };
  }

  //Handles updateing the username textfield
  changedMake = pname => {  
    this.setState({
      make: pname
    });
  }

  changedModel = pname => {  
    this.setState({
      model: pname
    });
  }

  changedYear = pname => {  
    this.setState({
      year: pname
    });
  }
  
  Search = () => { 
    const { make } = this.state;
    const { model } = this.state;
    const { year } = this.state;
    const { navigate } = this.props.navigation;
    var that = this;
    if ( make === "" | model === "" | year === ""){
        Platform.OS === 'ios' ? alert('Please fill out all fields') : ToastAndroid.show('Please fill out all fields', ToastAndroid.SHORT);
    }
    else{
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/SearchCars",true);
        xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhttp.send(`make=${make}&model=${model}&year=${year}`);

        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function() {
          if(this.readyState == 4 && this.status == 200){ 
              var data = this.responseText;
              if (data.includes("\"id\"")){
                data = JSON.parse(data);
                //console.log(data[0]['recallInfo'][0]);
                //if(data.length === 1){
                  navigate('Detail',{Pinfo: data[0]['recallInfo'][0], Type: 'rcars'});
                // }
                // else{
                //   navigate('List',{Pinfo: data, Type: 'rcars'});
                // }
              }
              else{
                Platform.OS === 'ios' ? alert('No Recalls Found') : ToastAndroid.show('No Recalls Found', ToastAndroid.SHORT);
              }  
          }
         
        };
        xhttp2.open("POST", "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetCars",true);
        xhttp2.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhttp2.send(`make=${make}&model=${model}&year=${year}`);
    }
  }
  
    render() {
      return (
        <View style={styles.container}>
         <View style={styles.rectangle27 }>
            <Image source={require('assets/UrRecallsLogo.png')} style={{width:180,height:140}} />
          </View> 
          <KeyboardAvoidingView style= {styles.rectangle1} behavior="padding" enabled>
          <View >
              <Text style={styles.text}>Search by Make, Model, Year</Text>
              <TextInput
                  style={styles.rectangle17}
                  placeholder="Make"
                  onChangeText={this.changedMake}
              />
              <Text> </Text>
              <TextInput
                  style={styles.rectangle17}
                  placeholder="Model"
                  onChangeText={this.changedModel}
              />
              <Text> </Text>
              <TextInput
                  style={styles.rectangle17}
                  placeholder="Year"
                  onChangeText={this.changedYear}
              />
              <View style={{padding:40}}>
                <Button  onPress={this.Search} 
                  title= "Search"     
                  color = "#bbd753"    
                /> 
              </View>
          </View>

         
         
        </KeyboardAvoidingView>
      </View> 
      );
    }
  }
  const styles = StyleSheet.create({
    rectangle27: {
      width: '100%',
      height: 150,
      paddingTop: 5,
      backgroundColor: '#d9dde2',
      justifyContent: "center",
      borderBottomWidth: 4,
      alignItems: 'center',
      borderBottomColor: 'transparent'
    },
    rectangle1: {
      width: 375,
      height: 812,
      backgroundColor: '#0e729e',
    },
    rectangle17: {
      width: 236,
      height: 34,
      color: "#bbd753",
      alignSelf: 'center',
      fontSize: 20,
      borderBottomColor: '#bbb',
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    text: {
      paddingTop: 10,
      paddingBottom: 20,
      color: '#d9dde2',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 1.25,
      alignSelf: 'center',
      borderBottomWidth: 5,
      borderBottomColor: 'transparent'
    },
    rectangle14: {
      width: 214,
      height: 37,
      backgroundColor: '#ffe308',
      padding: 3,
    },
    rectangle7: {
      width: 375,
      height: 72,
      borderRadius: 2,
      backgroundColor: '#ffdd00',
    },
    Text2: {
      fontSize: 18,
      color: 'white',
      marginRight: 10
    },
    SignUpText: {
      fontSize: 25,
      color: '#ffdd00',
      marginRight: 10
    },
    container: {
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      marginTop: 0,
      borderColor: '#707070',
      borderStyle: 'solid',
      paddingTop: 0,
      borderWidth: 1,
      backgroundColor: '#0e729e',
    },
  });