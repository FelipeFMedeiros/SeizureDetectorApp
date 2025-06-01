import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, Vibration } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width } = Dimensions.get('window');

interface SeizureAlertProps {
    visible: boolean;
    onClose: () => void;
    seizureData?: {
        startTime: string;
        duration: number;
        intensity: 'Leve' | 'Moderada' | 'Grave';
    };
}

export function SeizureAlert({ visible, onClose, seizureData }: SeizureAlertProps) {
    const router = useRouter();

    // Simulação de reprodução de som e vibração
    useEffect(() => {
        if (visible) {
            // Padrão de vibração: 1s de vibração, 0.5s de pausa, repetindo
            const pattern = [0, 1000, 500];
            Vibration.vibrate(pattern, true);

            // Simulação de som (em um app real, usaríamos Audio do Expo)
            console.log('Tocando som de alerta!');

            return () => {
                Vibration.cancel();
                console.log('Som de alerta parado!');
            };
        }
    }, [visible]);

    const handleViewDetails = () => {
        onClose();
        router.push('/monitoring');
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
            <ThemedView style={styles.modalContainer}>
                <ThemedView style={styles.alertContent}>
                    <Image
                        source={require('@/assets/images/brain-emergency.png')}
                        style={styles.alertIcon}
                        contentFit="contain"
                    />

                    <ThemedText type="title" style={styles.alertTitle}>
                        CRISE EPILÉTICA DETECTADA!
                    </ThemedText>

                    {seizureData && (
                        <ThemedView style={styles.detailsContainer}>
                            <ThemedView style={styles.detailRow}>
                                <ThemedText type="defaultSemiBold">Início:</ThemedText>
                                <ThemedText>{seizureData.startTime}</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.detailRow}>
                                <ThemedText type="defaultSemiBold">Duração:</ThemedText>
                                <ThemedText>{seizureData.duration} segundos</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.detailRow}>
                                <ThemedText type="defaultSemiBold">Intensidade:</ThemedText>
                                <ThemedText>{seizureData.intensity}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                    )}

                    <ThemedText style={styles.alertMessage}>
                        Uma possível crise epilética foi detectada pelo dispositivo. Verifique o paciente imediatamente.
                    </ThemedText>

                    <ThemedView style={styles.emergencyCallInfo}>
                        <ThemedText type="defaultSemiBold" style={styles.emergencyText}>
                            Liga de emergência ativa para os contatos cadastrados.
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
                            <ThemedText style={styles.dismissButtonText}>PARAR ALERTA</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
                            <ThemedText style={styles.detailsButtonText}>VER DETALHES</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContent: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    alertIcon: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    alertTitle: {
        fontSize: 24,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 20,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    alertMessage: {
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    emergencyCallInfo: {
        backgroundColor: '#FF3B3020',
        borderRadius: 12,
        padding: 12,
        width: '100%',
        marginBottom: 24,
    },
    emergencyText: {
        color: '#FF3B30',
        textAlign: 'center',
    },
    actionsContainer: {
        width: '100%',
        gap: 12,
    },
    dismissButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
    },
    dismissButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailsButton: {
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },
    detailsButtonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
