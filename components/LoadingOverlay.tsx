import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export default function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
    const bounce = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            bounce.value = withRepeat(
                withSequence(
                    withTiming(-15, { duration: 600, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
                ),
                -1,
                true
            );
        } else {
            bounce.value = 0;
        }
    }, [visible]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: bounce.value }],
        };
    });

    return (
        <Modal transparent={true} animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                        {/* A fun, child-friendly searching icon */}
                        <MaterialCommunityIcons name="bird" size={80} color="#2b8cee" />
                        <View style={styles.badge}>
                            <MaterialCommunityIcons name="magnify" size={24} color="white" />
                        </View>
                    </Animated.View>

                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.subMessage}>Stay still for a moment!</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Lighter, friendlier background
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        paddingHorizontal: 40,
        paddingVertical: 50,
        borderRadius: 40,
        alignItems: 'center',
        shadowColor: '#2b8cee',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 6,
        borderColor: '#ecfeff', // Very light blue/cyan
        width: '85%',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 30,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#fbbf24', // Yellow/Orange
        padding: 8,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: 'white',
    },
    message: {
        fontSize: 32, // Even Bigger text
        color: '#0f172a', // Dark slate
        fontWeight: '900', // Extra bold
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subMessage: {
        fontSize: 18,
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
    }
});
