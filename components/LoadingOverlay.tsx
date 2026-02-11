import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
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

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#eecd2b',      // Yellow
    orange: '#fb923c',       // Orange
    lavender: '#e6e6fa',     // Lavender
    bgLight: '#f3f0ff',      // Soft pastel
    purpleLight: '#d8b4fe',
    blue: '#60a5fa',
    white: '#ffffff',
    text: '#1b190d',
    purpleDark: '#581c87',  // Deep Purple
};

export default function LoadingOverlay({ visible, message = 'Finding Your Name...' }: LoadingOverlayProps) {
    if (!visible) return null;

    // Animation values
    const progress = useSharedValue(0);
    const rotate = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const float = useSharedValue(0);
    const pulseGlow = useSharedValue(1);

    useEffect(() => {
        // Progress bar animation
        progress.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Orbit rotation
        rotate.value = withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1,
            false
        );

        // Mascot breathing
        scale.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.95, { duration: 1000 })
            ),
            -1,
            true
        );

        // Floating particles
        float.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        // Pulse Glow
        pulseGlow.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`
    }));

    const animatedOrbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }]
    }));

    const animatedMascotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const animatedFloatStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: float.value }]
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseGlow.value }],
        opacity: 0.5
    }));

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[COLORS.bgLight, '#ede9fe', '#fdf4ff']}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative Background Blobs */}
            <View style={[styles.blob, styles.blobBottomLeft]} />
            <View style={[styles.blob, styles.blobTopRight]} />

            {/* Ambient Background Particles */}
            <View style={{ position: 'absolute', top: 100, left: 40, opacity: 0.3 }}>
                <FontAwesome5 name="star" size={24} color={COLORS.primary} />
            </View>
            <View style={{ position: 'absolute', bottom: 150, right: 60, opacity: 0.2 }}>
                <FontAwesome5 name="cloud" size={40} color={COLORS.blue} />
            </View>

            {/* Central Mascot & Loader Section */}
            <View style={styles.centerContent}>

                {/* Visual Loader Container */}
                <View style={styles.loaderWrapper}>

                    {/* Pulsing Glow Behind */}
                    <Animated.View style={[styles.pulseglow, animatedGlowStyle]} />

                    {/* Outer Rainbow Ring (blurred background) */}
                    <LinearGradient
                        colors={['#ff9a9e', '#fad0c4', '#ffd1ff', '#a18cd1', '#84fab0', '#8fd3f4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.rainbowRingBlur}
                    />

                    {/* White Container Border */}
                    <View style={styles.whiteRingBorder} />

                    {/* Rotating Dashed Ring */}
                    <Animated.View style={[styles.dashedRingContainer, animatedOrbitStyle]}>
                        <View style={styles.dashedRing} />
                    </Animated.View>

                    {/* Mascot Container */}
                    <Animated.View style={[styles.mascotCircle, animatedMascotStyle]}>
                        <LinearGradient
                            colors={['#ffffff', '#f8fafc']}
                            style={styles.mascotGradient}
                        >
                            <MaterialIcons name="smart-toy" size={90} color={COLORS.primary} />
                            {/* "Thinking" bubbles */}
                            <View style={styles.thinkingBubbles}>
                                <View style={[styles.bubble, { width: 6, height: 6, bottom: 0, right: 0 }]} />
                                <View style={[styles.bubble, { width: 10, height: 10, bottom: 8, right: -8 }]} />
                                <View style={[styles.bubble, { width: 14, height: 14, bottom: 20, right: -16 }]} />
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Floating Particles */}
                    <Animated.View style={[styles.floatingStar, animatedFloatStyle]}>
                        <Ionicons name="sparkles" size={44} color={COLORS.primary} />
                    </Animated.View>
                    <Animated.View style={[styles.floatingHeart, animatedFloatStyle]}>
                        <FontAwesome5 name="heart" size={32} color="#f472b6" />
                    </Animated.View>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Scanning for Smiles...</Text>

                    <View style={styles.subtextContainer}>
                        <Text style={styles.subtitle}>Almost there, Superstar!</Text>

                        {/* Friendly Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarTrack} />
                            <Animated.View style={[styles.progressBarFill, animatedProgressStyle]}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.orange]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1 }}
                                />
                            </Animated.View>
                        </View>
                    </View>
                </View>

            </View>

            {/* Footer Help Button (Visual only based on design) */}
            <View style={styles.footer}>
                <View style={styles.helpButton}>
                    <View style={{ backgroundColor: COLORS.lavender, padding: 4, borderRadius: 20 }}>
                        <MaterialIcons name="help" size={20} color={COLORS.purpleDark} />
                    </View>
                    <Text style={styles.helpText}>Need help? Ask a Teacher</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.4,
    },
    blobBottomLeft: {
        bottom: -100, left: -60, width: 300, height: 300,
        backgroundColor: '#fef08a', // yellow-200
    },
    blobTopRight: {
        top: 50, right: -80, width: 250, height: 250,
        backgroundColor: '#e9d5ff', // purple-200
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 400,
    },
    loaderWrapper: {
        width: 300, height: 300,
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', marginBottom: 40,
    },
    pulseglow: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: COLORS.primary, opacity: 0.2
    },
    rainbowRingBlur: {
        position: 'absolute', width: '100%', height: '100%', borderRadius: 150, opacity: 0.5,
        transform: [{ scale: 0.9 }]
    },
    whiteRingBorder: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        borderWidth: 12, borderColor: 'white',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
    },
    dashedRingContainer: {
        position: 'absolute', width: 260, height: 260,
        alignItems: 'center', justifyContent: 'center',
    },
    dashedRing: {
        width: 240, height: 240, borderRadius: 120,
        borderWidth: 4, borderColor: COLORS.primary, borderStyle: 'dashed',
    },
    mascotCircle: {
        width: 220, height: 220, borderRadius: 110,
        padding: 6, // space for inner gradient
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
    },
    mascotGradient: {
        flex: 1, borderRadius: 110, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    thinkingBubbles: { position: 'absolute', top: 40, right: 40 },
    bubble: {
        position: 'absolute', backgroundColor: '#e2e8f0', borderRadius: 99,
        borderWidth: 1, borderColor: 'white'
    },
    floatingStar: { position: 'absolute', top: 0, left: 10 },
    floatingHeart: { position: 'absolute', bottom: 40, right: 10 },

    textContainer: {
        alignItems: 'center', gap: 12, paddingHorizontal: 20, width: '100%',
    },
    title: {
        fontSize: 32, fontWeight: '900', color: '#1e293b', textAlign: 'center',
        letterSpacing: -0.5
    },
    subtextContainer: { alignItems: 'center', gap: 16, width: '100%' },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#64748b', textAlign: 'center' },

    progressBarContainer: {
        width: 220, height: 16, borderRadius: 10,
        backgroundColor: 'white', padding: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    progressBarTrack: {
        ...StyleSheet.absoluteFillObject, borderRadius: 10, backgroundColor: '#f1f5f9'
    },
    progressBarFill: {
        height: '100%', borderRadius: 8, overflow: 'hidden'
    },

    footer: {
        position: 'absolute', bottom: 50, alignItems: 'center', justifyContent: 'center', width: '100%',
    },
    helpButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 12, paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    helpText: { fontSize: 15, fontWeight: '700', color: '#475569' }
});
