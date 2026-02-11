import { FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import CameraComponent from '../../components/CameraComponent';
import LoadingOverlay from '../../components/LoadingOverlay';
import RecognitionSuccessResult from '../../components/RecognitionSuccessResult';
import { Config } from '../../constants/Config';
import { recognizeFace } from '../../services/lambdaService';
import { markAttendance } from '../../services/phpService';
import { AttendanceRecord, Student } from '../../types';

export default function AttendanceScreen() {
    const isFocused = useIsFocused();
    const [viewState, setViewState] = useState<'camera' | 'processing' | 'result'>('camera');
    const [resultMessage, setResultMessage] = useState('');
    const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
    const [confidenceInfo, setConfidenceInfo] = useState<number>(0);
    const [errorCount, setErrorCount] = useState(0);
    const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);

    // Reset to camera when leaving screen and coming back
    useEffect(() => {
        if (isFocused) {
            setViewState('camera');
            setRecognizedStudent(null);
            setAttendanceRecord(null);
        }
    }, [isFocused]);

    const handleCapture = async (uri: string) => {
        setViewState('processing');

        try {
            // 1. Recognize Face via AWS Lambda
            const recognition = await recognizeFace(uri);

            if (recognition.success && recognition.recognized && recognition.studentId) {
                const conf = recognition.confidence || 0;
                setConfidenceInfo(conf);

                // 2. Mark Attendance via PHP API
                if (conf >= Config.CONFIDENCE_THRESHOLD) {
                    await processAttendance(recognition.studentId, conf);
                } else {
                    setResultMessage(`Low confidence (${conf.toFixed(1)}%). Please try again.`);
                    setViewState('result');
                }
            } else {
                // Face not recognized
                setResultMessage(recognition.message || 'Face not recognized. Please enroll first.');
                setViewState('result');
                setErrorCount(prev => prev + 1);
            }

        } catch (error: any) {
            console.error('Capture Error:', error);
            setResultMessage('An error occurred. Please try again.');
            setViewState('result');
            setErrorCount(prev => prev + 1);
        }
    };

    const processAttendance = async (studentId: string, confidence: number) => {
        try {
            // Call PHP API to mark attendance
            const result = await markAttendance(studentId, confidence);

            if (result.success) {
                // Successfully marked attendance
                Vibration.vibrate(200); // Success vibration

                const student: Student = {
                    studentId: result.student?.id || studentId,
                    studentName: result.student?.name || `Student ${studentId}`,
                    photoUrl: result.student?.photo_url,
                    isPartTimeToday: result.student?.is_part_time_today,
                    checkInTime: result.student?.check_in_time
                };

                setRecognizedStudent(student);
                setAttendanceRecord(result);
                setResultMessage(result.message);
                setViewState('result');

            } else if (result.already_marked) {
                // Already checked in today
                Vibration.vibrate([100, 50, 100]); // Double vibration for duplicate

                const student: Student = {
                    studentId: result.student?.id || studentId,
                    studentName: result.student?.name || `Student ${studentId}`,
                    photoUrl: result.student?.photo_url,
                    checkInTime: result.student?.first_check_in
                };

                setRecognizedStudent(student);
                setAttendanceRecord(result);
                setResultMessage(result.message || 'Already checked in today');
                setViewState('result');

            } else {
                // Failed to mark attendance
                setResultMessage(result.error || 'Failed to mark attendance');
                setViewState('result');
            }

        } catch (error: any) {
            console.error('Attendance Error:', error);
            setResultMessage('Failed to record attendance. Please try again.');
            setViewState('result');
        }
    };

    const handleRetry = () => {
        setViewState('camera');
        setRecognizedStudent(null);
        setAttendanceRecord(null);
        setResultMessage('');
    };

    // Render based on state
    if (viewState === 'processing') {
        return <LoadingOverlay visible={true} message="Processing face recognition..." />;
    }

    if (viewState === 'result') {
        return (
            <View style={styles.container}>
                {recognizedStudent && attendanceRecord?.success ? (
                    <RecognitionSuccessResult
                        student={recognizedStudent}
                        confidence={confidenceInfo}
                        message={resultMessage}
                        alreadyMarked={attendanceRecord.already_marked || false}
                        isPartTime={recognizedStudent.isPartTimeToday || false}
                        checkInTime={recognizedStudent.checkInTime}
                        onDone={handleRetry}
                    />
                ) : (
                    <View style={styles.errorContainer}>
                        <FontAwesome5 name="exclamation-circle" size={64} color="#f44336" />
                        <Text style={styles.errorText}>{resultMessage}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    // Default: Camera view
    return (
        <CameraComponent
            onCapture={handleCapture}
            onCancel={() => { }}
            buttonLabel="Capture Face"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    errorText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
