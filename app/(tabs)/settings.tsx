import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Config } from '../../constants/Config';

export default function SettingsScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>App Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuration</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Institute ID:</Text>
                    <Text style={styles.value}>{Config.DEFAULT_INSTITUTE_ID}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Confidence Threshold:</Text>
                    <Text style={styles.value}>{Config.CONFIDENCE_THRESHOLD}%</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Timeout:</Text>
                    <Text style={styles.value}>{Config.REQUEST_TIMEOUT / 1000}s</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Management</Text>
                <SystemInitButton />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.text}>Face Recognition Attendance App</Text>
                <Text style={styles.text}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { createCollection } from '../../services/lambdaService';

function SystemInitButton() {
    const [loading, setLoading] = useState(false);

    const handleInit = async () => {
        setLoading(true);
        try {
            const result = await createCollection();
            if (result.success) {
                Alert.alert('Success', 'System initialized (Collection created)');
            } else {
                Alert.alert('Failed', result.message || 'Could not create collection');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleInit} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.buttonText}>Initialize Face Collection</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        marginTop: 20,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2196F3',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    label: {
        color: '#666',
        fontSize: 16,
    },
    value: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
