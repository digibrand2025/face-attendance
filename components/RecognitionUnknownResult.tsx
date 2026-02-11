
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface RecognitionUnknownResultProps {
    onRetry: () => void;
    message?: string;
    title?: string;
    iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function RecognitionUnknownResult({
    onRetry,
    message = "Who goes there?",
    title = "Wait, who are you?",
    iconName = "robot-confused"
}: RecognitionUnknownResultProps) {
    const scale = useSharedValue(0.5);
    const infoOpacity = useSharedValue(0);
    const rotateVal = useSharedValue(0);

    useEffect(() => {
        // Reveal animation
        scale.value = withSpring(1, { damping: 12 });
        infoOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));

        // Ongoing question mark animation
        rotateVal.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const infoStyle = useAnimatedStyle(() => ({
        opacity: infoOpacity.value,
    }));

    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotateVal.value}deg` }]
    }));

    const handleEnroll = () => {
        // Navigate to enroll tab
        router.push('/(tabs)/enroll');
    };

    return (
        <View style={styles.container}>
            {/* Background Overlay */}
            <View style={styles.overlay} />

            <Animated.View style={[styles.contentCard, containerStyle]}>

                {/* Status Icon */}
                <View style={styles.iconContainer}>
                    <Animated.View style={[styles.iconCircle, rotateStyle]}>
                        <MaterialCommunityIcons name={iconName} size={64} color="#f59e0b" />
                    </Animated.View>
                    <View style={styles.questionMark}>
                        <MaterialCommunityIcons name="help" size={32} color="#fff" />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Message */}
                <Text style={styles.message}>
                    {message || "I can see your face, but I don't know your name yet!"}
                </Text>

                <Animated.View style={[styles.infoContainer, infoStyle]}>
                    <View style={styles.tipBox}>
                        <Feather name="info" size={20} color="#f59e0b" />
                        <Text style={styles.tipText}>
                            If you are new here, you might need to enroll first!
                        </Text>
                    </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeIn.delay(600).springify()} style={styles.actions}>

                    <TouchableOpacity
                        style={[styles.button, styles.retryButton]}
                        onPress={onRetry}
                        activeOpacity={0.8}
                    >
                        <Feather name="refresh-ccw" size={20} color="#64748b" />
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.enrollButton]}
                        onPress={handleEnroll}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#d97706']}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.enrollText}>Enroll Now</Text>
                            <Feather name="arrow-right" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>

                </Animated.View>

            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    contentCard: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#f59e0b',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
        borderWidth: 2,
        borderColor: '#fef3c7',
    },
    iconContainer: {
        marginBottom: 24,
        position: 'relative',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fffbeb',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fcd34d',
    },
    questionMark: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#f59e0b',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        fontWeight: '500',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 24,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#b45309',
        fontWeight: '600',
        lineHeight: 20,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    retryButton: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    enrollButton: {
        backgroundColor: '#f59e0b',
        overflow: 'hidden',
        shadowColor: '#f59e0b',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    gradient: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    enrollText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
