import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import CameraComponent from '../../components/CameraComponent';
import LoadingOverlay from '../../components/LoadingOverlay';
import { enrollStudent } from '../../services/lambdaService';
import { Config } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

export default function EnrollScreen() {
    const router = useRouter();
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');

    const handleCapture = (uri: string) => {
        setImage(uri);
        setShowCamera(false);
    };

    const handleEnroll = async () => {
        if (!image) {
            Alert.alert('Error', 'Please capture a photo first');
            return;
        }
        if (!studentId || !studentName) {
            Alert.alert('Error', 'Please fill in Student ID and Name');
            return;
        }

        setLoading(true);
        try {
            const response = await enrollStudent(image, studentId, studentName);

            if (response.success) {
                Alert.alert('Success', 'Student enrolled successfully!', [
                    { text: 'OK', onPress: resetForm }
                ]);
            } else {
                Alert.alert('Enrollment Failed', response.message || response.error || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setImage(null);
        setStudentId('');
        setStudentName('');
        setStudentClass('');
    };

    if (showCamera) {
        return (
            <CameraComponent
                onCapture={handleCapture}
                onCancel={() => setShowCamera(false)}
                buttonLabel="Capture Face"
            />
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>New Enrollment</Text>

                <View style={styles.imageContainer}>
                    {image ? (
                        <View style={styles.previewContainer}>
                            <View style={styles.placeholder}>
                                <FontAwesome5 name="check-circle" size={50} color="#4CAF50" />
                                <Text style={styles.imageText}>Photo Captured</Text>
                            </View>
                            <TouchableOpacity style={styles.retakeButton} onPress={() => setShowCamera(true)}>
                                <Text style={styles.retakeText}>Retake Photo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.cameraPlaceholder} onPress={() => setShowCamera(true)}>
                            <FontAwesome5 name="camera" size={40} color="#ccc" />
                            <Text style={styles.placeholderText}>Tap to Take Photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Student ID *</Text>
                    <TextInput
                        style={styles.input}
                        value={studentId}
                        onChangeText={setStudentId}
                        placeholder="STU001"
                    />

                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={studentName}
                        onChangeText={setStudentName}
                        placeholder="John Doe"
                    />

                    <Text style={styles.label}>Class / Grade</Text>
                    <TextInput
                        style={styles.input}
                        value={studentClass}
                        onChangeText={setStudentClass}
                        placeholder="Grade 10-A"
                    />

                    <Text style={styles.label}>Institute ID</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={Config.DEFAULT_INSTITUTE_ID}
                        editable={false}
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleEnroll}>
                        <Text style={styles.submitButtonText}>Enroll Student</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <LoadingOverlay visible={loading} message="Enrolling Student..." />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    cameraPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        color: '#999',
    },
    previewContainer: {
        alignItems: 'center',
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageText: {
        marginTop: 5,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    retakeButton: {
        padding: 10,
    },
    retakeText: {
        color: '#2196F3',
        fontWeight: '600',
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        marginTop: 15,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        marginTop: 30,
        alignItems: 'center',
        elevation: 3,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
