import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { listEnrolledFaces } from '../../services/lambdaService';
import { EnrolledFace } from '../../types';

export default function StudentsScreen() {
    const [faces, setFaces] = useState<EnrolledFace[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFaces = async () => {
        try {
            setError(null);
            const response = await listEnrolledFaces();

            if (response.success) {
                setFaces(response.faces);
            } else {
                setError(response.error || 'Failed to load students');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFaces();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFaces();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading students...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchFaces}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Enrolled Students</Text>
                <Text style={styles.subtitle}>Total: {faces.length}</Text>
            </View>

            <FlatList
                data={faces}
                keyExtractor={(item) => item.faceId}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item, index }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardNumber}>#{index + 1}</Text>
                            <Text style={styles.studentId}>{item.studentId}</Text>
                        </View>
                        <View style={styles.cardDetails}>
                            <Text style={styles.detailText}>
                                Confidence: {item.confidence}%
                            </Text>
                            <Text style={styles.detailTextSmall} numberOfLines={1}>
                                Face ID: {item.faceId}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No students enrolled yet</Text>
                        <Text style={styles.emptySubtext}>
                            Go to Enroll tab to add students
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    studentId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#4CAF50',
        marginBottom: 5,
    },
    detailTextSmall: {
        fontSize: 12,
        color: '#999',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
});
