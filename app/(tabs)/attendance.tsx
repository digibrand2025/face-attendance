import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import CameraComponent from '../../components/CameraComponent';
import StudentCard from '../../components/StudentCard';
import LoadingOverlay from '../../components/LoadingOverlay';
import RecognitionSuccessResult from '../../components/RecognitionSuccessResult';
import { recognizeFace } from '../../services/lambdaService';
// import { markAttendance } from '../../services/phpService';
import { Config } from '../../constants/Config';
import { Student } from '../../types';
import { FontAwesome5 } from '@expo/vector-icons';

export default function AttendanceScreen() {
    const isFocused = useIsFocused();
    const [viewState, setViewState] = useState<'camera' | 'processing' | 'result'>('camera');
    const [resultMessage, setResultMessage] = useState('');
    const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
    const [confidenceInfo, setConfidenceInfo] = useState<number>(0);
    const [errorCount, setErrorCount] = useState(0);

    // Reset to camera when leaving screen and coming back
    useEffect(() => {
        if (isFocused) {
            setViewState('camera');
            setRecognizedStudent(null);
        }
    }, [isFocused]);

    const handleCapture = async (uri: string) => {
        setViewState('processing');

        try {
            // 1. Recognize Face
            const recognition = await recognizeFace(uri);

            if (recognition.success && recognition.recognized && recognition.studentId) {
                const conf = recognition.confidence || 0;
                setConfidenceInfo(conf);

                // Mock student data lookup
                const MOCK_STUDENTS: { [key: string]: string } = {
                    '1': 'Nisal Weerarathne',
                    '2': 'Lakshan Chathuranga'
                };

                const studentName = MOCK_STUDENTS[recognition.studentId] || 'Student ' + recognition.studentId;

                const studentData: Student = {
                    studentId: recognition.studentId,
                    studentName: studentName,
                    instituteId: Config.DEFAULT_INSTITUTE_ID
                };

                setRecognizedStudent(studentData);

                // 2. Mark Attendance
                if (conf >= Config.CONFIDENCE_THRESHOLD) {
                    await processAttendance(studentData, conf);
                } else {
                    setResultMessage('Low confidence. Please verify.');
                    setViewState('result');
                }

            } else {
                setResultMessage(recognition.message || 'Face not recognized');
                setErrorCount(prev => prev + 1);
                setViewState('result');
            }
        } catch (error) {
            setResultMessage('An error occurred during recognition');
            setViewState('result');
        }
    };

    const processAttendance = async (student: Student, confidence: number) => {
        // PHP Service Disabled for now
        /*
        const markRes = await markAttendance(
            student.studentId,
            confidence,
            new Date().toISOString(),
            student.instituteId || Config.DEFAULT_INSTITUTE_ID
        );
        */

        console.log('PHP Service Disabled: Attendance marking skipped for', student.studentId);

        // Mock success for UI feedback
        const markRes = { success: true };

        if (markRes.success) {
            setResultMessage('Attendance Marked (Offline) ✅');
            Vibration.vibrate(100);
        } else {
            setResultMessage('Recognized, but failed to mark attendance ❌');
        }
        setViewState('result');

        // Auto reset after 3 seconds
        // Auto reset timeout removed to allow user to view the success animation
        // User will manually click "Scan Next"
        /* 
        setTimeout(() => {
            if (isFocused) {
                setViewState('camera');
                setRecognizedStudent(null);
            }
        }, 3000); 
        */
    };

    if (viewState === 'camera') {
        return (
            <View style={{ flex: 1 }}>
                <CameraComponent
                    onCapture={handleCapture}
                    buttonLabel="Scan Face"
                />
                <View style={styles.overlayTextContainer}>
                    <Text style={styles.overlayText}>Position face within frame</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {viewState === 'processing' && (
                <LoadingOverlay visible={true} message="Recognizing..." />
            )}

            {viewState === 'result' && recognizedStudent && (
                <RecognitionSuccessResult
                    student={recognizedStudent}
                    confidence={confidenceInfo}
                    onDismiss={() => {
                        setViewState('camera');
                        setRecognizedStudent(null);
                    }}
                />
            )}

            {viewState === 'result' && !recognizedStudent && (
                <View style={styles.resultContainer}>
                    <View style={styles.iconContainer}>
                        <FontAwesome5 name="times-circle" size={80} color="#F44336" />
                    </View>

                    <Text style={styles.resultTitle}>Not Recognized</Text>
                    <Text style={styles.resultDetails}>{resultMessage}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.retryButton} onPress={() => setViewState('camera')}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20,
    },
    overlayTextContainer: {
        position: 'absolute',
        top: 60,
        width: '100%',
        alignItems: 'center',
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    resultContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    resultDetails: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
