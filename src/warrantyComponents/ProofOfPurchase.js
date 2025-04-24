import React, { Component } from 'react';
import {View, Modal, Image, Text, StyleSheet, Alert,TouchableOpacity} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermissionsAsync } from 'expo-camera';

class ProofOfPurchase extends Component{
    constructor(props) {
        super(props);
        this.state = {
            setImage: '',
            setImageView: false
        };
    }
    redirectToThankYou = () => {
        this.setState({setImageView: false});
        this.props.navigation.navigate("ThankYou");
    };

    async verifyPermissions() {
        const result = await requestCameraPermissionsAsync();
        if (result.status !== 'granted') {
            Alert.alert(
                'Insufficient permissions!',
                'You need to grant camera permissions to use this app.',
                [{ text: 'Okay' }]
            );
            return false;
        }
        return true;
    };

    takeImageHandler = async () => {
        const hasPermission = await this.verifyPermissions();
        if (!hasPermission) {
            return;
        }
        const image = await ImagePicker.launchCameraAsync({
            quality: 0.5
        });

        if(!image.cancelled) {
            this.setState({setImage: image.uri})
            this.setStHan();
        }
    };
    setStHan=()=>{
        this.setState({setImageView:true})
        console.log(this.state.setImageView)
    }
    render(){
        return (

            <View style={styles.container}>
                <View style={styles.subContainer_01}>
                    <Text style={styles.titleText}>Warranty Registration</Text>
                    <Image source={require('assets/Logo.png')} style={{width:90,height:70}} />
                    <Text style={styles.subTitleText}>Proof Of Purchase</Text>
                </View>
                <Text style={styles.subText}>If You Have </Text>
                <Text style={styles.subText02}>Proof Of Purchase</Text>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress={(e)=>{this.takeImageHandler(e)}}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>Take Picture Of Receipt</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Modal visible={this.state.setImageView} animationType="slide">
                    <View style={styles.picSize}>
                        <Image style={styles.image} source={{ uri: this.state.setImage }} />
                    </View>
                    <View style={styles.container02}>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableOpacity onPress={this.redirectToThankYou.bind(this)}>

                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>Submit</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                </Modal>
            </View>

        );
    };

};

const styles = StyleSheet.create({
    picSize: {
        width: '100%',
        //height: '80%',
        flex: 4,
        marginBottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ccc',
        borderBottomWidth: 1.5,
        borderWidth: 1

    },
    container02: {
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        marginTop: 0,
        flex: 1,
        borderStyle: 'solid',
        paddingTop: 0,
        backgroundColor: '#0e729e',
        borderWidth: 3,
        borderTopWidth: 1.5,
        borderColor: '#9acd32',

    },
    image: {
        borderWidth: 3,
        borderColor: '#9acd32',
        width: '100%',
        height: '100%'
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
        color: '#d9dde2',
    },
    subText02:{
        paddingTop: 10,
        paddingBottom: 5,
        letterSpacing: .50,
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#d9dde2',
    },
    button: {
        backgroundColor:'#9acd32',
        marginTop: 40,
        paddingVertical: 35,
        paddingHorizontal: 35,
        paddingBottom: 15,
        paddingTop: 15,
        paddingLeft: 50,
        paddingRight: 50,
        borderRadius: 25
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    }
});

export default ProofOfPurchase;
