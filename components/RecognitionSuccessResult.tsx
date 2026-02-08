import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Student } from '../types';

interface RecognitionSuccessResultProps {
    student: Student;
    confidence: number;
    onDismiss: () => void;
}

const { width } = Dimensions.get('window');

const COLORS = {
    primary: "#2b8cee",
    backgroundLight: "#f6f7f8",
    backgroundDark: "#101922",
    success: "#2ECC71",
    slate900: "#0f172a",
    slate500: "#64748b",
    slate400: "#94a3b8",
    slate100: "#f1f5f9",
    white: "#ffffff",
    green100: "#dcfce7",
    green700: "#15803d",
    blue200: "#bfdbfe",
};

export default function RecognitionSuccessResult({ student, confidence, onDismiss }: RecognitionSuccessResultProps) {

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Confetti Background */}
            <View style={styles.confettiContainer} pointerEvents="none">
                <View style={[styles.confetti, { top: 40, left: 40, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fbbf24', opacity: 0.6 }]} />
                <View style={[styles.confetti, { top: 80, right: 80, width: 12, height: 12, backgroundColor: '#f87171', transform: [{ rotate: '45deg' }], opacity: 0.6 }]} />
                <View style={[styles.confetti, { top: 160, left: '25%', width: 8, height: 24, backgroundColor: COLORS.primary, transform: [{ rotate: '-12deg' }], opacity: 0.4 }]} />
                <View style={[styles.confetti, { top: 48, right: '33%', width: 12, height: 12, borderRadius: 4, backgroundColor: '#4ade80', transform: [{ rotate: '12deg' }], opacity: 0.5 }]} />
                <View style={[styles.confetti, { top: 20, left: '50%', width: 16, height: 16, borderRadius: 8, backgroundColor: '#c084fc', opacity: 0.3 }]} />
            </View>

            {/* Main Card */}
            <Animated.View entering={FadeInUp.springify()} style={styles.card}>

                {/* Header Image Section */}
                <View style={styles.cardHeader}>
                    {/* Decorative Gradient Overlay (Simplified) */}
                    <View style={styles.headerGradient} />

                    {/* Success Badge */}
                    <View style={styles.successBadge}>
                        <MaterialIcons name="verified" size={18} color={COLORS.green700} />
                        <Text style={styles.successBadgeText}>Success!</Text>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzpB_cUkr96JYnaYwRpo--tvZHaHUYtieqC6r6g-7QYR96asD-QR047qgHx_rLYOxactWprcAR8he9UnhJIy1iy-zh0bC0oOyjheRco7TidcZFaWhLAdjU1vwUjvxv_Q1VOVSgRWVmN6pQMrGdVuJ9VtqvNLyhmEAIx6ljfq-1fjg1IDGaMPxTmX2N3roDe4yToUizzSBV6WFcRFBZvQfQee4JGfm3K9D3EC8FikkXHEP2mS2vtESCp6AQgiYRFvvo-qEr_GEGNA' }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.checkBadge}>
                            <MaterialIcons name="check" size={24} color="white" />
                        </View>
                    </View>

                    <Text style={styles.studentNameTitle}>Great job, {student.studentName.split(' ')[0]}!</Text>
                    <Text style={styles.subText}>You're all checked in.</Text>

                    <View style={styles.timestampPill}>
                        <MaterialIcons name="schedule" size={16} color={COLORS.slate500} style={{ marginRight: 6 }} />
                        <Text style={styles.timestampText}>
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.scoreCard}>
                        <View>
                            <Text style={styles.scoreLabel}>Attendance Score</Text>
                            <Text style={styles.scoreValue}>95%</Text>
                        </View>
                        <View style={styles.scoreIconCircle}>
                            <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
                        </View>
                    </View>

                    {/* Today's Classes */}
                    <View style={styles.classesContainer}>
                        <Text style={styles.classesTitle}>Today's Classes</Text>
                        <View style={styles.classesGrid}>

                            {/* Animation */}
                            <View style={[styles.classItem, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                                <View style={[styles.classIcon, { backgroundColor: '#ffedd5' }]}>
                                    <MaterialIcons name="animation" size={20} color="#ea580c" />
                                </View>
                                <Text style={styles.classText}>Animation</Text>
                            </View>

                            {/* Mathematics */}
                            <View style={[styles.classItem, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                                <View style={[styles.classIcon, { backgroundColor: '#dbeafe' }]}>
                                    <MaterialIcons name="calculate" size={20} color="#2563eb" />
                                </View>
                                <Text style={styles.classText}>Maths</Text>
                            </View>

                            {/* Programming */}
                            <View style={[styles.classItem, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}>
                                <View style={[styles.classIcon, { backgroundColor: '#dcfce7' }]}>
                                    <MaterialIcons name="terminal" size={20} color="#16a34a" />
                                </View>
                                <Text style={styles.classText}>Coding</Text>
                            </View>

                            {/* Graphic Designing */}
                            <View style={[styles.classItem, { backgroundColor: '#faf5ff', borderColor: '#f3e8ff' }]}>
                                <View style={[styles.classIcon, { backgroundColor: '#f3e8ff' }]}>
                                    <MaterialIcons name="palette" size={20} color="#9333ea" />
                                </View>
                                <Text style={[styles.classText, { fontSize: 11 }]}>Graphics</Text>
                            </View>

                        </View>
                    </View>

                    <TouchableOpacity style={styles.doneButton} onPress={onDismiss} activeOpacity={0.9}>
                        <Text style={styles.doneButtonText}>Done</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>

            </Animated.View>

            <Text style={styles.footerNote}>Hand the tablet to the next student</Text>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    confetti: {
        position: 'absolute',
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
        overflow: 'hidden',
    },
    cardHeader: {
        height: 128,
        backgroundColor: 'rgba(43, 140, 238, 0.1)', // primary/10
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 24,
        position: 'relative',
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.2,
        // Gradient simulation not perfect without Expo Linear Gradient, but background color does the job mostly
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.green100,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    successBadgeText: {
        color: COLORS.green700,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    heroSection: {
        alignItems: 'center',
        marginTop: -64,
        paddingHorizontal: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: COLORS.white,
        backgroundColor: COLORS.slate100,
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.success,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: COLORS.white,
    },
    studentNameTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.slate900,
        textAlign: 'center',
        marginTop: 4,
    },
    subText: {
        fontSize: 18,
        color: COLORS.slate500,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    timestampPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.slate100,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
    },
    timestampText: {
        color: COLORS.slate500,
        fontSize: 14,
        fontWeight: '600',
    },
    infoSection: {
        padding: 24,
        width: '100%',
        gap: 16,
    },
    scoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(43, 140, 238, 0.05)', // primary/5
        borderWidth: 1,
        borderColor: 'rgba(43, 140, 238, 0.1)',
        borderRadius: 16,
        padding: 16,
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate500,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
    },
    scoreIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(43, 140, 238, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: COLORS.blue200,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
        marginTop: 8,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    footerNote: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        marginTop: 32,
        textAlign: 'center',
    },
    classesContainer: {
        marginTop: 8,
        gap: 12,
    },
    classesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.slate900,
        paddingHorizontal: 4,
    },
    classesGrid: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    classItem: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
    },
    classIcon: {
        padding: 8,
        borderRadius: 999,
    },
    classText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.slate500,
        textAlign: 'center',
    },
});
