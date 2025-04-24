//import 'react-native-gesture-handler';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header(){
    const navigation = useNavigation();


    const openMenu = () => {
        navigation.openDrawer();
    };
    return(
        <View>
            <MaterialIcons name='menu' size ={28} onPress={openMenu} style={styles.icon}/>
        </View>
    );
}

const styles = StyleSheet.create({
    icon:{
        position: 'absolute',
        alignSelf: 'center',
        left: 16,
    },
});





