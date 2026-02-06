import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { Config } from '../constants/Config';
import * as ImagePicker from 'expo-image-picker';

interface CameraComponentProps {
    onCapture: (base64Image: string) => void;
    onCancel?: () => void;
    buttonLabel?: string;
}

export default function CameraComponent({ onCapture, onCancel, buttonLabel = 'Capture' }: CameraComponentProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('front');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: Config.IMAGE_QUALITY,
                    base64: true,
                    skipProcessing: true, // Faster capture
                });

                if (photo?.base64) {
                    // If we need a preview, we might restart here or just pass it up.
                    // For now, let's show a preview state within this component before confirming?
                    // The prompt says "Show captured image preview"
                    setPreviewUri(photo.uri);
                    // We keep the base64 to return
                    // But wait, the component manages preview state?
                    // Let's store base64 in a ref or state if we want to confirm
                }
            } catch (e) {
                console.error("Failed to take picture", e);
            }
        }
    };

    const confirmCapture = async () => {
        if (previewUri) {
            // Re-read base64 or keep it? 
            // takePictureAsync returns base64. 
            // Let's re-take it properly or simple way:
            // The previous call returned base64. 
            // Let's adjust logic to store base64 result.
        }
    };

    // Revised take picture logic to handle preview
    const handleCapture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({
                quality: Config.IMAGE_QUALITY,
                base64: true,
            });
            if (photo?.base64) {
                onCapture(photo.base64);
            }
        }
    }

    // If we want a built-in preview/retake flow, it's better to implement it here.
    // Prompt says: "Photo preview after capture with Retake/Confirm buttons"

    if (previewUri) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
                <View style={styles.previewControls}>
                    <TouchableOpacity style={[styles.controlButton, styles.retakeButton]} onPress={() => setPreviewUri(null)}>
                        <Text style={styles.text}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlButton, styles.confirmButton]} onPress={async () => {
                        // We need base64 here. 
                        // Optimization: Reading file again is slow. 
                        // Better: Store base64 in state.
                    }}>
                        <Text style={styles.text}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Implementation with internal state for base64:

    return (
        <CameraComponentContent
            onCapture={onCapture}
            onCancel={onCancel}
            buttonLabel={buttonLabel}
            facing={facing}
            setFacing={setFacing}
            flash={flash}
            setFlash={setFlash}
            cameraRef={cameraRef}
        />
    );
}

// Breaking out to handle the logic cleanly with state within the component not just return
function CameraComponentContent({ onCapture, onCancel, buttonLabel, facing, setFacing, flash, setFlash, cameraRef }: any) {
    const [image, setImage] = useState<{ uri: string, base64: string } | null>(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // 1. Take picture without base64 (saves memory)
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1, // High quality original
                    skipProcessing: false,
                });

                if (photo) {
                    // 2. Resize and Compress using Manipulator
                    const manipulated = await ImagePicker.ImageManipulator.manipulateAsync(
                        photo.uri,
                        [{ resize: { width: 800 } }], // Resize to 800px width (maintains aspect ratio)
                        { compress: 0.7, format: ImagePicker.ImageManipulator.SaveFormat.JPEG, base64: true }
                    );

                    setImage({ uri: manipulated.uri, base64: manipulated.base64 || '' });
                }
            } catch (e) {
                console.error("Failed to take picture", e);
            }
        }
    };

    if (image) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: image.uri }} style={styles.camera} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => setImage(null)}>
                        <Text style={styles.text}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={() => onCapture(image.base64)}>
                        <Text style={styles.text}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'))}>
                        <Text style={styles.text}>Flip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setFlash((current: FlashMode) => (current === 'off' ? 'on' : 'off'))}>
                        <Text style={styles.text}>{flash === 'on' ? 'Flash On' : 'Flash Off'}</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
            {onCancel && (
                <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white'
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    previewImage: {
        flex: 1,
        width: '100%',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 30,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 10,
        borderRadius: 8,
    },
    iconButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    captureInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonText: {
        color: 'blue',
        fontSize: 18,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    previewControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        bottom: 40,
        position: 'absolute',
        width: '100%',
    },
    controlButton: {
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        minWidth: 100,
        alignItems: 'center',
    },
    retakeButton: {
        backgroundColor: '#F44336',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    }
});
