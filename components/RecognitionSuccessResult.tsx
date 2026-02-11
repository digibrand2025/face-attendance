import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Student } from '../types';

interface Props {
    student: Student;
    confidence: number;
    message: string;
    alreadyMarked?: boolean;
    isPartTime?: boolean;
    checkInTime?: string;
    onDone: () => void;
}

const { width } = Dimensions.get('window');

// Child-friendly colors
const COLORS = {
    yellow: '#FCD34D', // Amber 300
    orange: '#fb923c', // Orange 400
    blue: '#60a5fa',   // Blue 400
    pink: '#f472b6',   // Pink 400
    green: '#4ade80',  // Green 400
    purple: '#c084fc', // Purple 400
    white: '#ffffff',
    bg: '#F0F9FF',     // Sky 50
};

export default function RecognitionSuccessResult({
    student,
    confidence, // Used for 'Star Power'
    message,
    alreadyMarked = false,
    isPartTime = false,
    checkInTime,
    onDone
}: Props) {

    // Animations
    const scaleVal = useSharedValue(0.5);
    const starRotate = useSharedValue(0);
    const bounceVal = useSharedValue(0);

    useEffect(() => {
        // Pop-in effect
        scaleVal.value = withSpring(1, { damping: 10, stiffness: 100 });

        // Star rotation
        starRotate.value = withRepeat(withTiming(360, { duration: 10000, easing: Easing.linear }), -1, false);

        // Gentle bounce for the button or avatar
        bounceVal.value = withRepeat(withSequence(
            withTiming(-10, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
        ), -1, true);
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleVal.value }]
    }));

    const animatedStarStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${starRotate.value}deg` }]
    }));

    const animatedBounceStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bounceVal.value }]
    }));

    // Format time for display
    const formattedTime = checkInTime
        ? new Date(checkInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Mock data for "Today's Adventures"
    const classes = [
        { name: 'Fun Math', icon: 'calculator', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
        { name: 'Art Time', icon: 'palette', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
        { name: 'Discovery', icon: 'flask', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Playful Background Elements */}
            <View style={styles.backgroundContainer} pointerEvents="none">
                {/* Sun */}
                <Animated.View style={[styles.bgSun, animatedStarStyle]}>
                    <Ionicons name="sunny" size={100} color={COLORS.yellow} />
                </Animated.View>
                {/* Cloud */}
                <View style={[styles.bgCloud, { top: 100, left: -20 }]}>
                    <Ionicons name="cloud" size={80} color={COLORS.blue} style={{ opacity: 0.3 }} />
                </View>
                <View style={[styles.bgCloud, { top: 200, right: -40 }]}>
                    <Ionicons name="cloud" size={120} color={COLORS.pink} style={{ opacity: 0.2 }} />
                </View>

                {/* Stars/Confetti */}
                <View style={[styles.confetti, { top: 60, left: 60, transform: [{ rotate: '15deg' }] }]}>
                    <FontAwesome5 name="star" size={24} color={COLORS.purple} />
                </View>
                <View style={[styles.confetti, { top: 120, right: 40, transform: [{ rotate: '-10deg' }] }]}>
                    <FontAwesome5 name="heart" size={20} color={COLORS.pink} />
                </View>
                <View style={[styles.confetti, { bottom: 100, left: 40, transform: [{ rotate: '25deg' }] }]}>
                    <MaterialCommunityIcons name="emoticon-happy" size={30} color={COLORS.orange} />
                </View>
            </View>

            {/* Main Container Card */}
            <Animated.View style={[styles.card, animatedCardStyle]}>

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={alreadyMarked ? [COLORS.orange, '#fdba74'] : [COLORS.blue, '#93c5fd']}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Floating Icons Background */}
                    <View style={styles.patternOverlay}>
                        <MaterialCommunityIcons name="shape-plus" size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: 20, left: 20 }} />
                        <MaterialCommunityIcons name="shape-circle-plus" size={30} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: 50, right: 40 }} />
                        <MaterialCommunityIcons name="shape-square-plus" size={25} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', bottom: 30, left: '50%' }} />
                    </View>

                    {/* Success Badge */}
                    <View style={[
                        styles.successBadge,
                        alreadyMarked ? styles.badgeWarning : styles.badgeSuccess
                    ]}>
                        <FontAwesome5
                            name={alreadyMarked ? "info-circle" : "check"}
                            size={16}
                            color={alreadyMarked ? "#b45309" : "#15803d"}
                        />
                        <Text style={[
                            styles.successBadgeText,
                            { color: alreadyMarked ? "#b45309" : "#15803d" }
                        ]}>
                            {alreadyMarked ? "Already Here!" : "Yay, Success!"}
                        </Text>
                    </View>
                </View>

                {/* Hero Section: Avatar & Checkmark */}
                <View style={styles.heroSection}>
                    <Animated.View style={[styles.avatarContainer, animatedBounceStyle]}>
                        <View style={styles.avatarBorder}>
                            {student.photoUrl ? (
                                <Image
                                    source={{ uri: student.photoUrl }}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }]}>
                                    <FontAwesome5 name="user-astronaut" size={50} color={COLORS.blue} />
                                </View>
                            )}
                        </View>

                        {/* Large Checkmark Badge */}
                        <View style={[
                            styles.checkmarkBadge,
                            alreadyMarked ? { backgroundColor: COLORS.orange } : { backgroundColor: COLORS.green }
                        ]}>
                            <FontAwesome5 name={alreadyMarked ? "exclamation" : "smile-wink"} size={32} color="white" />
                        </View>
                    </Animated.View>

                    <Text style={styles.greetingTitle}>
                        Hi, {student.studentName.split(' ')[0]}!
                    </Text>
                    <Text style={styles.greetingEmoji}>👋✨</Text>

                    <Text style={styles.subtitle}>
                        {alreadyMarked ? "You are already checked in!" : "Welcome back to school!"}
                    </Text>

                    {/* Timestamp Badge */}
                    <View style={[
                        styles.timestampBadge,
                        alreadyMarked && { backgroundColor: '#fff7ed', borderColor: '#fed7aa' } // orange-50, orange-200
                    ]}>
                        <FontAwesome5
                            name="clock"
                            size={16}
                            color={alreadyMarked ? COLORS.orange : COLORS.blue}
                        />
                        <Text style={[
                            styles.timestampText,
                            alreadyMarked && { color: '#ea580c' } // orange-600
                        ]}>
                            {alreadyMarked ? "First seen at" : "Arrived at"} {formattedTime}
                        </Text>
                    </View>
                </View>

                {/* Info Cards Section */}
                <View style={styles.contentSection}>

                    {/* Star Power Card */}
                    <View style={styles.scoreCard}>
                        <View>
                            <Text style={styles.scoreLabel}>Star Power</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <Text style={styles.scoreValue}>{confidence ? Math.min(100, Math.floor(confidence)) : 0}</Text>
                                <Text style={styles.scoreUnit}>/100</Text>
                            </View>
                        </View>
                        <View style={styles.scoreIconCircle}>
                            <Ionicons name="star" size={32} color={COLORS.yellow} />
                        </View>
                    </View>

                    {/* Today's Adventures */}
                    <View style={styles.classesSection}>
                        <Text style={styles.sectionTitle}>Today's Adventures</Text>
                        <View style={styles.classesGrid}>
                            {classes.map((item, index) => (
                                <View key={index} style={[styles.classCard, { backgroundColor: item.bg, borderColor: item.border }]}>
                                    <View style={[styles.classIconCircle, { backgroundColor: 'white' }]}>
                                        <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <Text style={styles.className}>{item.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Done Button */}
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={onDone}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.blue, '#3b82f6']}
                            style={styles.doneButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.doneButtonText}>I'm Ready!</Text>
                            <FontAwesome5 name="rocket" size={20} color="white" />
                        </LinearGradient>
                        <View style={styles.buttonShadow} />
                    </TouchableOpacity>

                </View>

            </Animated.View>

            {/* Footer Note */}
            <Text style={styles.footerNote}>Please pass the tablet to a friend! 🤝</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: COLORS.bg,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    bgSun: {
        position: 'absolute',
        top: -20,
        right: -20,
        opacity: 0.8,
    },
    bgCloud: {
        position: 'absolute',
    },
    confetti: {
        position: 'absolute',
        opacity: 0.8,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: 'white',
        borderRadius: 32,
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 4,
        borderColor: 'white',
    },
    headerSection: {
        height: 140,
        backgroundColor: COLORS.blue,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 24,
    },
    patternOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    successBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 10,
        transform: [{ rotate: '-2deg' }] // Playful tilt
    },
    badgeSuccess: {
        backgroundColor: '#f0fdf4', // green-50
        borderColor: '#dcfce7',
        borderWidth: 2,
    },
    badgeWarning: {
        backgroundColor: '#fff7ed', // orange-50
        borderColor: '#ffedd5',
        borderWidth: 2,
    },
    successBadgeText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    heroSection: {
        paddingHorizontal: 24,
        marginTop: -60,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarBorder: {
        padding: 6,
        backgroundColor: 'white',
        borderRadius: 999,
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#f1f5f9',
    },
    checkmarkBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 5,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    greetingTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b', // slate-800
        textAlign: 'center',
        marginBottom: 0,
    },
    greetingEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748b', // slate-500
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    timestampBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff', // sky-50
        borderWidth: 2,
        borderColor: '#bae6fd',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        gap: 8,
    },
    timestampText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0284c7', // sky-600
    },
    contentSection: {
        padding: 24,
        gap: 20,
    },
    scoreCard: {
        backgroundColor: '#fffbeb', // amber-50
        borderWidth: 2,
        borderColor: '#fde68a', // amber-200
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: COLORS.yellow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    scoreLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#d97706', // amber-600
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#b45309', // amber-700
    },
    scoreUnit: {
        fontSize: 16,
        fontWeight: '700',
        color: '#d97706',
        marginLeft: 4,
        marginBottom: 6,
    },
    scoreIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#fcd34d',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fcd34d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    classesSection: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#334155',
        marginLeft: 4,
    },
    classesGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    classCard: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        // Playful hover effect simulation via margin/shadow
        marginBottom: 4,
    },
    classIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    className: {
        fontSize: 13,
        fontWeight: '800',
        color: '#475569',
        textAlign: 'center',
    },
    doneButton: {
        marginTop: 10,
        marginBottom: 10,
    },
    doneButtonGradient: {
        paddingVertical: 18,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        zIndex: 2,
    },
    buttonShadow: {
        position: 'absolute',
        bottom: -6,
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: '#1d4ed8', // Darker blue for 3D effect
        borderRadius: 24,
        zIndex: 1,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    footerNote: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 30,
    },
});
