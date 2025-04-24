import React, { Component } from 'react'
import {StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal} from "react-native";

export default class WarrantyStatus extends Component {
    /*
    redirectTo(){
        this.props.navigation.navigate("UserContactInfo");
    }
    */
    constructor(props) {
        super(props);
        this.state = {
            setImageView01: false,
            setImageView02: false,
            setImageView03: false
        };
    }
    setStHan01=()=>{
        this.setState({setImageView01:true});
        console.log(this.state.setImageView01)
    };
    setStHan02=()=>{
        this.setState({setImageView02:true});
        console.log(this.state.setImageView01)
    };
    setStHan03=()=>{
        this.setState({setImageView03:true});
        console.log(this.state.setImageView01)
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.subContainer_01}>
                    <Text style={styles.titleText}>Warranty Registration</Text>
                    <Image source={require('assets/Logo.png')} style={{width: 90, height: 70}}/>
                    <Text style={styles.subTitleText}>Status Of Your Warranty</Text>
                </View>
                <ScrollView>
                        <View style={styles.subContainer_02}>
                            <TouchableOpacity onPress={() => this.setStHan01()}>
                                <Image source={require('assets/Completed.png')} style={{width: 340, height: 210}} />
                            </TouchableOpacity>
                        </View>
                            <Modal visible={this.state.setImageView01}
                                   animationType='none'
                                   onRequestClose={() => { this.setState({setImageView01:false});}}
                                >
                                <View style={styles.subContainer_02}>
                                    <Image source={require('assets/SnowBlowerStatus.png')} style={{width: 340, height: 210}} />
                                </View>
                            </Modal>
                        <View style={styles.subContainer_03}>
                            <TouchableOpacity onPress={() => this.setStHan02()}>
                                <Image source={require('assets/InstantPot.png')} style={{width: 340, height: 210}}/>
                            </TouchableOpacity>
                        </View>
                            <Modal visible={this.state.setImageView02}
                                   animationType='none'
                                   onRequestClose={() => { this.setState({setImageView02:false});}}
                                >
                                <View style={styles.subContainer_02}>
                                    <Image source={require('assets/InstantPotStatus.png')} style={{width: 340, height: 210}} />
                                </View>
                            </Modal>
                        <View style={styles.subContainer_04}>
                            <TouchableOpacity onPress={() => this.setStHan03()}>
                                <Image source={require('assets/Drill.png')} style={{width: 340, height: 210}}/>
                            </TouchableOpacity>
                        </View>
                            <Modal visible={this.state.setImageView03}
                                   animationType='none'
                                   onRequestClose={() => { this.setState({setImageView03:false});}}
                                >
                                <View style={styles.subContainer_02}>
                                    <Image source={require('assets/DrillStatus.png')} style={{width: 340, height: 210}} />
                                </View>
                            </Modal>
                </ScrollView>
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
        borderBottomWidth: 3,
        alignItems: 'center',
        borderBottomColor: 'black'
    },
    subContainer_02:{
        width: '100%',
        height: '100%',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: '#0e729e',
        alignItems: 'center',
        flex: 1,
        marginBottom: 0,
        marginTop: 30,
        borderWidth: 3,
        borderColor: '#9acd32',
    },
    subContainer_03:{
        width: '100%',
        height: '100%',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: '#0e729e',
        alignItems: 'center',
        flex: 1,
        marginBottom: 0,
        marginTop: 30,
        borderWidth: 3,
        borderColor: '#9acd32',
    },
    subContainer_04:{
        width: '100%',
        height: '100%',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: '#0e729e',
        alignItems: 'center',
        flex: 1,
        marginBottom: 0,
        marginTop: 30,
        borderWidth: 3,
        borderColor: '#9acd32',
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
        paddingBottom: 25,
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