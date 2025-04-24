import React, {Component} from "react";
import { Button, Text,KeyboardAvoidingView, 
  ToastAndroid, Platform ,View,Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";


  
export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pname: "",
    };
  }

  //Handles updateing the username textfield
  changedPName = pname => {  
    this.setState({
      pname: pname
    });
  }
  
  Search = () => { 
    const { pname } = this.state;
    const { navigate } = this.props.navigation;
    var that = this;
    if ( pname === ""){
        Platform.OS === 'ios' ? alert('Please fill out') : ToastAndroid.show('Please fill out', ToastAndroid.SHORT);
    }
    else{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200){
                var data = this.responseText;
                //User Verified is the response from the server
                if (data.includes("\"id\"")){
                  data = JSON.parse(data);
                  //console.log(data);
                  if(data.length === 1){
                    navigate('Detail',{Pinfo: data, Type: 'rgoods'});
                  }
                  else{
                    navigate('List',{Pinfo: data, Type: 'rgoods'});
                  }
                }
                else{
                  Platform.OS === 'ios' ? alert('No Recalls Found') : ToastAndroid.show('No Recalls Found', ToastAndroid.SHORT);
                }  
            }
        };
        xhttp.open("POST", "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetGoods",true);
        xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhttp.send(`name=${pname}`);
    }
  }
  Scan(){
    this.props.navigation.navigate('Barcode',{type: 'goods'});
  }
    render() {
      return (
        <View style={styles.container}>
         <View style={styles.rectangle27 }>
              <Image source={require('assets/UrRecallsLogo.png')} style={{width:180,height:140}} />
          </View> 
          <KeyboardAvoidingView style= {styles.rectangle1} behavior="padding" enabled>
          <View >
                    <Text style={styles.text}>Search the Manufacturer of the Product</Text>
                    <TextInput
                        style={styles.rectangle17}
                        placeholder="Search Product"
                        autoCapitalize = 'none'
                        onChangeText={this.changedPName}
                    />
                    <View style={{padding:40}}>
                      <Button  onPress={this.Search} 
                        title= "Search"     
                        color = "#bbd753"    
                      /> 
                    </View>
          </View>

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.text}>Scan the UPC of your Product</Text>
                    <TouchableOpacity
                      onPress={() => this.Scan()}
                    >
                    <Image source={require('assets/barcode.png')} style={{width:180,height:180}} />
          
                    </TouchableOpacity>
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