import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    FadeIn,
    ZoomIn,
    SlideInDown
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { Student } from '../types';

interface RecognitionSuccessResultProps {
    student: Student;
    confidence: number;
    onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export default function RecognitionSuccessResult({ student, confidence, onDismiss }: RecognitionSuccessResultProps) {
    // Shared value for the checkmark scale animation
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );
    }, []);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={styles.container}>
            {/* Background Blob/Circle */}
            <Animated.View
                entering={ZoomIn.duration(600)}
                style={styles.successBg}
            />

            {/* Success Icon */}
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                <View style={styles.iconCircle}>
                    <FontAwesome5 name="check" size={50} color="white" />
                </View>
            </Animated.View>

            {/* Text Content */}
            <Animated.View
                entering={SlideInDown.delay(300).springify()}
                style={styles.contentContainer}
            >
                <Text style={styles.statusText}>Attendance Marked!</Text>

                <View style={styles.studentCard}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {student.studentName.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.studentName}>{student.studentName}</Text>
                        <Text style={styles.studentId}>ID: {student.studentId}</Text>
                        <Text style={styles.confidenceText}>Confidence: {confidence.toFixed(1)}%</Text>
                    </View>
                </View>

                <View style={styles.timeContainer}>
                    <FontAwesome5 name="clock" size={16} color="#666" />
                    <Text style={styles.timeText}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString()}
                    </Text>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={onDismiss}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Scan Next Student</Text>
                    <FontAwesome5 name="arrow-right" size={16} color="white" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    successBg: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: '#E8F5E9', // Light green
        top: '15%',
    },
    iconContainer: {
        marginBottom: 30,
        marginTop: -50,
        shadowColor: "#4CAF50",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: 'white',
    },
    contentContainer: {
        width: '85%',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2E7D32',
        marginBottom: 30,
        letterSpacing: 0.5,
    },
    studentCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 25,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    infoContainer: {
        flex: 1,
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    studentId: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    confidenceText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        backgroundColor: '#E8F5E9',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginLeft: 8,
        marginRight: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#888',
    },
    button: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
