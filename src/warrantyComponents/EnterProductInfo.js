import React, {Component} from "react";
import {View,Text,StyleSheet,TextInput,TouchableOpacity,Image,Platform,KeyboardAvoidingView,
    ScrollView,ToastAndroid} from "react-native";


export default class EnterProductInfo extends Component {
    redirectToUserInfo(){
        this.props.navigation.navigate("UserContactInfo");
    }
    constructor(props){
        super(props);

        this.state = {
            serialNum: "",
            modelNum: "",
            manufacturer: ""
        };
    }
//Handlers
//______________________________________________________________________________________________________________________
    serialNumHandler = sn => {
        this.setState({
            serialNum: sn
        });
    };
    modelNumHandler = mn => {
        this.setState({
            modelNum: mn
        });
    };
    manufacturerNumHandler = man => {
        this.setState({
            manufacturer: man
        });
    };
//______________________________________________________________________________________________________________________


//Ajax to handle input
//______________________________________________________________________________________________________________________
    productInfoSubmit = () => {
        const { serialNum } = this.state;
        const { modelNum } = this.state;
        const { manufacturer } = this.state;
        //const { navigate } = this.props.navigation;
        console.log(serialNum);
        console.log(modelNum);
        console.log(manufacturer);
        if ( serialNum === "" || modelNum === "" || manufacturer === ""){
            Platform.OS === 'ios' ? alert('Please fill out all fields') : ToastAndroid.show('Please fill out all fields', ToastAndroid.SHORT);
        }
        else{
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if(this.readyState === 4 && this.status === 200){
                    //let data = this.responseText;
                }
            };
            /*
            xhttp.open("POST", "http://ec2-34-227-36-231.compute-1.amazonaws.com/general/getUser",true);
            xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhttp.send(`username=${userName}&password=${password}`);

             */
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
                        android: () => 100
                    })()}>
                    <ScrollView>
                    <View style={styles.subContainer_01}>
                        <Text style={styles.titleText}>Warranty Registration</Text>
                            <Image source={require('assets/Logo.png')} style={{width:90,height:70}} />
                        <Text style={styles.subTitleText}>Product Info</Text>
                    </View>
                    <Text style={styles.subText}>Type Product Info Below</Text>
                    <View style = {styles.textBoxSection}>
                        <TextInput
                            autoCorrect={false}
                            placeholder="Serial Number (S/N):"
                            placeholderTextColor="white"
                            style={styles.textInput}
                            clearButtonMode="always"
                            returnKeyType = "next"
                            onChangeText={this.serialNumHandler}
                        />
                        <TextInput
                            autoCorrect={false}
                            placeholder="Model Number:"
                            placeholderTextColor="white"
                            style={styles.textInput}
                            clearButtonMode="always"
                            returnKeyType = "next"
                            onChangeText={this.modelNumHandler}
                        />
                        <TextInput
                            autoCorrect={false}
                            placeholder="Manufacturer:"
                            placeholderTextColor="white"
                            style={styles.textInput}
                            clearButtonMode="always"
                            returnKeyType = "next"
                            onChangeText={this.manufacturerNumHandler}
                        />
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={(e)=> {this.productInfoSubmit(e);
                                            this.redirectToUserInfo(e)}}>
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
        flex: 2,
        flexDirection: 'column',
    },
    textBoxSection:{
        paddingTop: 10,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9acd32',
    },
    textInput: {
        backgroundColor: '#666',
        color: 'white',
        height: 40,
        width: 300,
        marginTop: 20,
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