import React from "react";
import {
    View, Text, StyleSheet, Platform, TextInput, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Image, ToastAndroid
} from "react-native";
import store from "../store";

export default class UserContactInfo extends React.Component {
    redirectToProofOfPurchase(){
        this.props.navigation.navigate("ProofOfPurchase");
    }
    constructor(props){
        super(props);
        this.state = {
            fName: "",
            lName: "",
            email: "",
            addrLine1: "",
            addrLine2: "",
            city: "",
            state: "",
            zip: "",
            isLoading: true,
            addressid: "",
            addressLoaded: false
        };
    }
//Handlers
//______________________________________________________________________________________________________________________
    fNameHandler = fn => {
        this.setState({
            fName: fn
        });
    };
    lNameHandler = ln => {
        this.setState({
            lName: ln
        });
    };
    emailHandler = em => {
        this.setState({
            email: em
        });
    };
    addrLine1Handler = a1 => {
        this.setState({
            addrLine1: a1
        });
    };
    addrLine2Handler = a2 => {
        this.setState({
            addrLine2: a2
        });
    };
    cityHandler = cy => {
        this.setState({
            city: cy
        });
    };
    stateHandler = st => {
        this.setState({
            state: st
        });
    };
    zipHandler = zp => {
        this.setState({
            zip: zp
        });
    };
//______________________________________________________________________________________________________________________


    componentDidMount() {
        let userid = store.getState().userID
        const encodedUserId = encodeURIComponent(userid);
        let url = `http://ec2-34-227-36-231.compute-1.amazonaws.com/general/Address?userid=${encodedUserId}`
        console.log(userid);
        console.log(url);

        return fetch(url,{
            method: "GET",
            redirect: 'follow'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson[0]);
                this.setState({
                    fName: responseJson[0].fname,
                    lName: responseJson[0].lname,
                    email: responseJson[0].email,
                    addrLine1: responseJson[0].street1,
                    addrLine2: responseJson[0].street2,
                    city: responseJson[0].city,
                    state: responseJson[0].state,
                    zip: responseJson[0].zip,
                    isLoading: false,
                    addressid: responseJson[0].id,
                    addressLoaded: true
                })
                store.setState({warranty: {
                    ...this.state.warranty,
                    ['addressid']:responseJson[0].id
                  }
                });
                console.log(store.getState().warranty)
            })

         .catch((error)=>{
             console.log("No User Address Found")
         });

    }

//Ajax to handle input
//______________________________________________________________________________________________________________________
    userInfoSubmit = (e) => {
        e.preventDefault();
        const { fName } = this.state;
        const { lName } = this.state;
        const { email } = this.state;
        const { addrLine1 } = this.state;
        const { addrLine2 } = this.state;
        const { city } = this.state;
        const { state } = this.state;
        const { zip } = this.state;
        //const { navigate } = this.props.navigation;
        console.log(fName);
        console.log(lName);
        console.log(email);
        console.log(addrLine1);
        console.log(addrLine2);
        console.log(city);
        console.log(state);
        console.log(zip);

        if ( fName === "" || lName === "" || email === ""|| addrLine1 === ""||
            city === ""|| state === ""|| zip === ""){
            Platform.OS === 'ios' ? alert('Please fill out all fields') : ToastAndroid.show('Please fill out all fields', ToastAndroid.SHORT);
        }
        else{
            if(!this.state.addressLoaded) {
                let url = `http://ec2-34-227-36-231.compute-1.amazonaws.com/general/Address`

                let data = JSON.stringify({
                    "fname": fName,
                    "lname": lName,
                    "email": email,
                    "street1": addrLine1,
                    "street2": addrLine2,
                    "city": city,
                    "state": state,
                    "zip": zip,
                    "user": store.getState().userID
                });
                console.log(data);

                let myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                fetch(url, {
                    method: "POST",
                    redirect: 'follow',
                    headers: myHeaders,
                    body: data,
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log(responseJson);

                        store.setState({
                            warranty: {
                                ...this.state.warranty,
                                ['addressid']: responseJson.id
                            }
                        });
                        console.log(store.getState().warranty)
                        this.redirectToProofOfPurchase();
                    })

                    .catch((error) => {
                        console.log("Address Not Created")
                    });

            } else if(this.state.addressLoaded) {
                this.redirectToProofOfPurchase();
            }else{
                Platform.OS === 'ios' ? alert('Error Saving Address') : ToastAndroid.show('Error Saving Address', ToastAndroid.SHORT);
            }
        }
    };
//______________________________________________________________________________________________________________________

    render() {
        return (
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior="padding"
                    enabled
                    keyboardVerticalOffset={Platform.select({
                        ios: () => 0,
                        android: () => 75
                    })()}>
                    <ScrollView>
                        <View style={styles.subContainer_01}>
                            <Text style={styles.titleText}>Warranty Registration</Text>
                            <Image source={require('assets/Logo.png')} style={{width:90,height:70}} />
                            <Text style={styles.subTitleText}>Contact Info</Text>
                        </View>
                            <Text style={styles.subText}>Type Your Info Below</Text>
                            <Text style={styles.subText02}>One Time Process!</Text>
                        <View style = {styles.textBoxSection}>
                            <TextInput
                                autoCorrect={false}
                                placeholder="First Name"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.fName}
                                onChangeText={this.fNameHandler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Last Name"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.lName}
                                onChangeText={this.lNameHandler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Email Address"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.email}
                                onChangeText={this.emailHandler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Address Line 1"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.addrLine1}
                                onChangeText={this.addrLine1Handler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Address Line 2"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.addrLine2}
                                onChangeText={this.addrLine2Handler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="City"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.city}
                                onChangeText={this.cityHandler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="State"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.state}
                                onChangeText={this.stateHandler}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Zip Code"
                                placeholderTextColor="white"
                                style={styles.textInput}
                                clearButtonMode="always"
                                returnKeyType = "next"
                                value={this.state.zip}
                                onChangeText={this.zipHandler}
                            />
                        </View>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableOpacity onPress={(e)=> {this.userInfoSubmit(e);}}>
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>Next</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </KeyboardAvoidingView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    keyBoard: {
        backgroundColor: '#0e729e',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
    },
    textBoxSection:{
        paddingTop: 25,
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
    subContainer_01:{
        width: '100%',
        height: 150,
        paddingTop: 5,
        backgroundColor: '#d9dde2',
        justifyContent: "center",
        borderBottomWidth: 4,
        alignItems: 'center',
        borderBottomColor: 'transparent'
    },
    titleText:{
        paddingTop: 10,
        paddingBottom: 10,
        letterSpacing: 1.25,
        alignSelf: 'center',
        fontSize: 30,
        fontWeight: "bold"
    },
    subTitleText:{
        paddingTop: 0,
        paddingBottom: 10,
        letterSpacing: .50,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold'
    },
    subText:{
        paddingTop: 20,
        paddingBottom: 5,
        letterSpacing: .50,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#9acd32',
    },
    subText02:{
        paddingTop: 10,
        paddingBottom: 5,
        letterSpacing: .50,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#9acd32',
    },
    textInput: {
        backgroundColor: '#666',
        color: 'white',
        height: 40,
        width: 300,
        marginTop: 10,
        marginHorizontal: 20,
        paddingHorizontal: 10,
        alignSelf: 'center',
    },
    button: {
        backgroundColor:'#9acd32',
        marginTop: 20,
        paddingVertical: 30,
        paddingHorizontal: 30,
        paddingLeft: 70,
        paddingRight: 70,
        borderRadius: 25
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold'
    }
});