import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Text, TouchableOpacity, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

import { SifterSearch } from '~/network/network_request';
import Page from '~/FDAtest';
import { error, log, t } from '~/utility/utility';
import { NormalText } from '~/components/generic';
import { MainTabParamList } from '~/navigators/main_navigator';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = 300;

export type BarcodeScreenProps = StackScreenProps<MainTabParamList, 'Barcode'>;

export default function Barcode({ navigation }: BarcodeScreenProps) {
    //  Some states required for Better Functioning
    const _isFocused = useIsFocused();
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(false);
    const scanned_time = useRef(new Date().getTime());
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (_isFocused && hasCameraPermission) {
            startAnimation();
        }
    }, [_isFocused, hasCameraPermission]);

    // Animation for Scanner
    const startAnimation = () => {
        scanLineAnim.setValue(0);
        Animated.loop(
            Animated.timing(scanLineAnim, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
            })
        ).start();
    };

    const handleBarCodeScanned = ({ data }: any) => {
        if (data.length !== 12) data = data.slice(1);

        if (new Date().getTime() - scanned_time.current <= 1000) {
            return;
        }
        log('UPC', data);
        scanned_time.current = new Date().getTime();

        new Promise((resolve, reject) => {
            SifterSearch(data, 'upc', 1)
                .then((results) => {
                    if (!results.Pinfo || results.Pinfo.length === 0) {
                        error('Results are undefined');
                        reject();
                    } else {
                        Page(results.Pinfo[0])
                            .then((pageResults: any) => {
                                resolve({
                                    Pinfo: pageResults.Pinfo,
                                    Type: pageResults.Type,
                                    recallData: pageResults.recallData,
                                });
                            })
                            .catch(() => {
                                error('Failed FDA Async Call');
                                reject();
                            });
                    }
                })
                .catch(() => {
                    error('Failed SifterSearch Async Call');
                    reject();
                });
        })
            .then((results: any) => {
                log('Promise Success: ' + results.Pinfo);
                navigation.navigate('FoodDetails', { Pinfo: results.Pinfo, recallData: results.recallData });
            })
            .catch(() => {
                alert('Search Failed');
                error('Promise Failed');
            });
    };

    const pickImageFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            alert('Image selected: ' + imageUri);
        }
    };

    if (hasCameraPermission === null) return <NormalText>{t("barcode_requesting")}</NormalText>;
    if (hasCameraPermission === false) return <NormalText>{t("barcode_denied")}</NormalText>;

    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCAN_BOX_SIZE - 2],
    });

    return (
        <>
            {_isFocused && (
                <CameraView
                    onBarcodeScanned={handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                >
                    <View style={styles.overlay}>
                        <View style={styles.header}>
                            <Text style={styles.scanText}>Scan</Text>
                            <Text style={styles.avertText}>AVERT</Text>
                        </View>

                        <View style={styles.scannerBox}>
                            {/* Colored Corners */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />

                            {/* Animated Scan Line */}
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    { transform: [{ translateY: scanLineTranslateY }] },
                                ]}
                            />
                        </View>

                        {/* Upload Button */}
                        <TouchableOpacity
                            onPress={pickImageFromGallery}
                            style={styles.uploadButton}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="image" size={20} color="#000" />
                            <Text style={styles.uploadText}>Upload from gallery</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    scanText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    avertText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFC107',
        marginLeft: 4,
    },
    scannerBox: {
        width: SCAN_BOX_SIZE,
        height: SCAN_BOX_SIZE,
        position: 'relative',
        borderColor: '#ffffff20',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopColor: '#FFC107',
        borderLeftColor: '#FFC107',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopColor: '#000000',
        borderRightColor: '#000000',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomColor: '#FFC107',
        borderRightColor: '#FFC107',
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    uploadButton: {
        flexDirection: 'row',
        backgroundColor: '#EDEDED',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: 'center',
        position: 'absolute',
        bottom: 60,
    },
    uploadText: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#000',
        fontSize: 14,
    },
});