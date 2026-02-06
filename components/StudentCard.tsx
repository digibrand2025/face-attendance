import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Student } from '../types';

interface StudentCardProps {
    student: Student;
    confidence?: number;
}

export default function StudentCard({ student, confidence }: StudentCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.name}>{student.studentName}</Text>
                {confidence && confidence > 0 && (
                    <View style={[styles.badge, confidence > 90 ? styles.badgeSuccess : styles.badgeWarning]}>
                        <Text style={styles.badgeText}>{confidence.toFixed(1)}%</Text>
                    </View>
                )}
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>ID:</Text>
                <Text style={styles.value}>{student.studentId}</Text>
            </View>

            {student.class && (
                <View style={styles.row}>
                    <Text style={styles.label}>Class:</Text>
                    <Text style={styles.value}>{student.class}</Text>
                </View>
            )}

            {student.instituteId && (
                <View style={styles.row}>
                    <Text style={styles.label}>Institute:</Text>
                    <Text style={styles.value}>{student.instituteId}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '90%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    badgeSuccess: {
        backgroundColor: '#E8F5E9',
    },
    badgeWarning: {
        backgroundColor: '#FFF3E0',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: 80,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#222',
        flex: 1,
    }
});
