import React, { Component } from 'react'
import {StyleSheet, Text, View, Image, TouchableOpacity} from "react-native";


class Warranty extends Component{
//------------------------------------------------------------------
    redirectToProdInfo(){
        this.props.navigation.navigate("EnterProductInfo");
    }
    Scan(){
        this.props.navigation.navigate('Barcode',{type: 'warrantyScanner'});
    }
//------------------------------------------------------------------
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.subContainer_01}>
                    <Text style={styles.titleText}>Warranty Registration</Text>
                    <Image source={require('assets/Logo.png')} style={{width:90,height:70}} />
                    <Text style={styles.subTitleText}>Scan Barcode</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.subText}>Press Scanner Icon</Text>
                    <View style={styles.upcBorder}>
                        <TouchableOpacity
                            onPress={() => this.Scan()}>
                            <Image source={require('assets/barcode.png')} style={{width:180,height:180}} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => this.redirectToProdInfo()}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>No Barcode</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
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
        paddingTop: 15,
        paddingBottom: 10,
        letterSpacing: 1.25,
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        borderBottomWidth: 5,
        borderBottomColor: 'transparent',
        color: '#9acd32',
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
        marginTop: 20,
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
export default Warranty