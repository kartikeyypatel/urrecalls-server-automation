import React, { Component } from 'react'
import {StyleSheet, Text, View, Image, TouchableOpacity} from "react-native";

export default class ThankYou extends Component {
    redirectToWarrantyStatus(){
        this.props.navigation.navigate("WarrantyStatus");
    }
    constructor(props) {
        super(props);
    }

    render() {
    return (
        <View style={styles.container}>
            <View style={styles.subContainer_01}>
                <Text style={styles.titleText}>Warranty Registration</Text>
                <Image source={require('assets/Logo.png')} style={{width: 90, height: 70}}/>
                <Text style={styles.subTitleText}>Thank You</Text>
            </View>
            <View style={styles.subContainer_02}>
                <Image source={require('assets/CheckMark.png')} style={{width: 100, height: 100}}/>
            </View>
            <Text style={styles.subText}>Thank You</Text>
            <Text style={styles.subText02}>For Your Submission</Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>

                <TouchableOpacity onPress={() => this.redirectToWarrantyStatus()}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>View Status</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )}
}
//-----------------------------------------------------------------------------------------------------------------


const styles = StyleSheet.create({
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
    subContainer_02:{
        width: '100%',
        height: 100,
        paddingTop: 50,
        backgroundColor: '#0e729e',
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
        paddingTop: 50,
        paddingBottom: 0,
        letterSpacing: 1.25,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        borderBottomWidth: 5,
        borderBottomColor: 'transparent',
        color: '#d9dde2',
    },
    subText02:{
        paddingTop: 5,
        paddingBottom: 10,
        letterSpacing: 1.25,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        borderBottomWidth: 5,
        borderBottomColor: 'transparent',
        color: '#d9dde2',
    },
    upcBorder:{
        backgroundColor: 'grey',
        borderWidth: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    button: {
        backgroundColor:'#9acd32',
        marginTop: 15,
        paddingVertical: 30,
        paddingHorizontal: 30,
        borderRadius: 25
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold'
    }
});