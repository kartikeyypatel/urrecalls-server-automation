// src/components/ScannerModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Text, TouchableOpacity, Platform, Modal, ActivityIndicator } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera'; // Use CameraView
import { useIsFocused } from '@react-navigation/native'; // Import if needed, though modal visibility might suffice
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from "react-native-vector-icons/Feather";

// Assuming these are correctly implemented and imported
import { SifterSearch } from '~/network/network_request'; // Adjust path
import Page from '~/FDAtest'; // Adjust path
import { error, log } from '~/utility/utility'; // Adjust path
import { COLORS } from '../../styles/colors'; // Adjust path

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = 300; // Or adjust as needed

// Define the structure of the data expected from successful scan/lookup
export interface ScanResultData {
    identifier: string; // The scanned barcode data
    name?: string;
    category?: string;
    specifications?: string;
    // Add any other fields returned by SifterSearch/Page that you want to use
}

interface ScannerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onScanSuccess: (data: ScanResultData) => void;
    onError: (message: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isVisible, onClose, onScanSuccess, onError }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false); // To show activity indicator during API calls
    const scannedTime = useRef<number>(0);
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    // const isFocused = useIsFocused(); // May not be needed if modal controls camera activation

    useEffect(() => {
        // Request permissions when modal becomes visible or permission state changes
        if (isVisible) {
            (async () => {
                log('Requesting camera permissions...');
                const { status } = await Camera.requestCameraPermissionsAsync();
                log('Permission status:', status);
                setHasPermission(status === 'granted');
                if (status !== 'granted') {
                    onError('Camera permission denied.');
                    onClose(); // Close modal if permission denied
                } else {
                    startAnimation(); // Start animation only if permission granted and modal visible
                }
            })();
        } else {
             // Stop animation when modal is closed
             scanLineAnim.stopAnimation();
        }
    }, [isVisible]); // Rerun effect when isVisible changes


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

    const handleBarCodeScanned = async (scanningResult: BarcodeScanningResult) => {
        const currentTime = Date.now();
        // Throttle scanning
        if (isLoading || currentTime - scannedTime.current <= 2000) { // Increased throttle time
            return;
        }
        scannedTime.current = currentTime;
        setIsLoading(true); // Show loading indicator

        let scannedData = scanningResult.data;
        log(`Barcode scanned: ${scannedData} (Type: ${scanningResult.type})`);

        // Basic UPC/EAN formatting attempt (adjust if needed)
        if (scannedData.length === 13 && scannedData.startsWith('0')) {
             scannedData = scannedData.substring(1); // Convert EAN-13 starting with 0 to UPC-A
        }

        try {
            // --- Call your lookup functions ---
            // NOTE: Ensure SifterSearch and Page handle errors gracefully
            log(`Calling SifterSearch for UPC: ${scannedData}`);
            const sifterResults = await SifterSearch(scannedData, 'upc', 1);

            if (!sifterResults || !sifterResults.Pinfo || sifterResults.Pinfo.length === 0) {
                throw new Error(`Product not found via SifterSearch for UPC ${scannedData}`);
            }
            log('SifterSearch successful:', sifterResults.Pinfo[0]);

            // Assuming Page function might add more details or is necessary
            log('Calling Page function...');
            const pageResults = await Page(sifterResults.Pinfo[0]);
            log('Page function successful:', pageResults);
            // --- End Lookup ---

            // --- Prepare Success Data ---
            // Adjust field names based on actual response structure from Page/SifterSearch
            const resultData: ScanResultData = {
                identifier: scannedData, // The original scanned barcode
                name: pageResults?.Pinfo?.name || sifterResults?.Pinfo[0]?.name || '',
                category: pageResults?.Pinfo?.category || sifterResults?.Pinfo[0]?.category || '',
                specifications: pageResults?.Pinfo?.brand_name || sifterResults?.Pinfo[0]?.brand_name || '', // Example: using brand_name for specs
                // Add other fields as needed
            };

            log('Scan success, returning data:', resultData);
            onScanSuccess(resultData);

        } catch (err: any) {
            error('Scan lookup failed:', err);
            onError(err.message || 'Failed to find product details for the scanned barcode.');
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCAN_BOX_SIZE - 2],
    });

    // Render nothing if not visible
    if (!isVisible) {
        return null;
    }

    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            animationType="slide"
            presentationStyle="pageSheet" // Or 'fullScreen'
        >
            <SafeAreaView style={styles.modalContainer}>
                {hasPermission === null && (
                    <View style={styles.infoContainer}><Text style={styles.infoText}>Requesting camera permission...</Text></View>
                )}
                {hasPermission === false && (
                     <View style={styles.infoContainer}><Text style={styles.infoText}>Camera permission denied.</Text></View>
                )}
                {hasPermission === true && (
                    <CameraView
                        onBarcodeScanned={isLoading ? undefined : handleBarCodeScanned} // Disable scanning while loading
                        barcodeScannerSettings={{
                            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"], // Add types as needed
                        }}
                        style={StyleSheet.absoluteFillObject}
                    >
                        <View style={styles.overlay}>
                             {/* Optional: Add a header within the modal */}
                             <View style={styles.modalHeader}>
                                 <Text style={styles.modalTitle}>Scan Barcode</Text>
                                 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                     <Feather name="x" size={24} color={COLORS.textLight} />
                                 </TouchableOpacity>
                             </View>

                            <View style={styles.scannerBox}>
                                {/* Corners */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                                {/* Animated Scan Line */}
                                <Animated.View style={[ styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] } ]} />
                            </View>
                            {isLoading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color={COLORS.secondary} />
                                    <Text style={styles.loadingText}>Looking up product...</Text>
                                </View>
                            )}
                            {/* Optional: Add upload from gallery button if needed */}
                        </View>
                    </CameraView>
                )}
                 {/* Fallback close button if camera fails */}
                {!hasPermission && (
                     <TouchableOpacity onPress={onClose} style={styles.fallbackCloseButton}>
                         <Text style={styles.fallbackCloseText}>Close</Text>
                     </TouchableOpacity>
                 )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'black', // Background for the modal safe area
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Overlay is within CameraView
    },
    modalHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 10 : 20, // Adjust as needed
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent header
    },
    modalTitle: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 10,
    },
    scannerBox: {
        width: SCAN_BOX_SIZE,
        height: SCAN_BOX_SIZE,
        position: 'relative',
        borderColor: '#ffffff80', // Semi-transparent white border
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        // Removed background color to see camera feed through it
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: COLORS.secondary, // Use theme color
        shadowColor: COLORS.secondary,
        shadowOpacity: 0.8,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.secondary, // Use theme color
        borderWidth: 5, // Thicker corners
    },
    topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
    topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
    bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
    bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textLight,
        marginTop: 10,
        fontSize: 16,
    },
     fallbackCloseButton: {
         position: 'absolute',
         top: Platform.OS === 'ios' ? 60 : 40,
         right: 15,
         padding: 10,
         backgroundColor: 'rgba(255,255,255,0.7)',
         borderRadius: 5,
     },
     fallbackCloseText: {
         color: '#000',
         fontWeight: 'bold',
     }
});

export default ScannerModal;
