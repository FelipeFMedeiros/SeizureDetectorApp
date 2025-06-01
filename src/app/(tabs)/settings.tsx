import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';

import { Collapsible } from '@/components/Collapsible';
import { SeizureAlert } from '@/components/SeizureAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, CommonStyles } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ContactItem {
    id: string;
    name: string;
    phone: string;
}

export default function SettingsScreen() {
    const [deviceEnabled, setDeviceEnabled] = useState(true);
    const [notifyContacts, setNotifyContacts] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [notificationDuration, setNotificationDuration] = useState('60');
    const [emergencyNumber, setEmergencyNumber] = useState('192');
    const [darkMode, setDarkMode] = useState(false);
    const [showTestAlert, setShowTestAlert] = useState(false);
    const [contactExpanded, setContactExpanded] = useState(false);
    const [contacts, setContacts] = useState<ContactItem[]>([
        { id: '1', name: 'João Silva', phone: '(21) 98765-4321' },
        { id: '2', name: 'Maria Souza', phone: '(21) 91234-5678' },
    ]);

    const colorScheme = useColorScheme() ?? 'light';
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Valores de animação
    const testButtonScale = useSharedValue(1);
    const deviceStatusOpacity = useSharedValue(deviceEnabled ? 1 : 0.5);
    const notificationDurationValue = useSharedValue(parseInt(notificationDuration, 10));

    // Efeito de animação para o texto do botão de teste
    const pulseTestButton = () => {
        testButtonScale.value = withSequence(withTiming(1.05, { duration: 200 }), withTiming(1, { duration: 200 }));
    };

    // Estilo animado para o botão de teste
    const testButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: testButtonScale.value }],
        };
    });

    // Estilo animado para o status do dispositivo
    const deviceStatusStyle = useAnimatedStyle(() => {
        return {
            opacity: deviceStatusOpacity.value,
        };
    });

    const handleDeviceToggle = (value: boolean) => {
        if (!value) {
            Alert.alert(
                'Desativar Dispositivo',
                'Tem certeza que deseja desativar o monitoramento? Você não receberá alertas em caso de crises.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Desativar',
                        onPress: () => {
                            setDeviceEnabled(false);
                            deviceStatusOpacity.value = withTiming(0.5);
                        },
                        style: 'destructive',
                    },
                ],
            );
        } else {
            setDeviceEnabled(true);
            deviceStatusOpacity.value = withTiming(1);
        }
    };

    const handleTestDevice = () => {
        pulseTestButton();
        Alert.alert(
            'Teste de Dispositivo',
            'Deseja testar o dispositivo agora? Isso simulará uma notificação de crise.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Testar',
                    onPress: () => {
                        setTimeout(() => {
                            setShowTestAlert(true);
                        }, 1000);
                    },
                },
            ],
        );
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Redefinir Configurações',
            'Tem certeza que deseja restaurar todas as configurações para o padrão?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Redefinir',
                    onPress: () => {
                        setDeviceEnabled(true);
                        deviceStatusOpacity.value = withTiming(1);
                        setNotifyContacts(true);
                        setSoundEnabled(true);
                        setVibrationEnabled(true);

                        // Animação para redefinir duração da notificação
                        const originalValue = 60;
                        notificationDurationValue.value = withTiming(originalValue, {
                            duration: 300,
                            easing: Easing.out(Easing.cubic),
                        });
                        setNotificationDuration('60');

                        setEmergencyNumber('192');
                        setDarkMode(false);
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    const handleChangeNotificationDuration = (value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setNotificationDuration(value);
        notificationDurationValue.value = withTiming(numValue, { duration: 300 });
    };

    const handleToggleContacts = () => {
        setContactExpanded(!contactExpanded);
    };

    const handleRemoveContact = (id: string) => {
        Alert.alert('Remover Contato', 'Tem certeza que deseja remover este contato?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: () => {
                    setContacts(contacts.filter((contact) => contact.id !== id));
                },
            },
        ]);
    };

    // Componente de teste de alerta
    const testAlertData = {
        startTime: new Date().toLocaleTimeString(),
        duration: 35,
        intensity: 'Leve' as const,
    };

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">Configurações</ThemedText>
                </ThemedView>

                <Animated.View
                    style={[
                        styles.deviceStatus,
                        { backgroundColor: Colors[theme].cardBackground },
                        CommonStyles.shadow,
                        deviceStatusStyle,
                    ]}
                >
                    <Animated.View entering={ZoomIn} style={styles.deviceImageContainer}>
                        <Image
                            source={require('@/assets/images/device-status.png')}
                            style={styles.deviceImage}
                            contentFit="contain"
                        />
                    </Animated.View>
                    <ThemedView style={styles.deviceInfo}>
                        <ThemedText type="subtitle">EpiTracker v1.0</ThemedText>
                        <ThemedText
                            style={{ color: deviceEnabled ? Colors[theme].success : Colors[theme].notification }}
                        >
                            Status: {deviceEnabled ? 'Ativo' : 'Inativo'}
                        </ThemedText>
                        <ThemedText style={[styles.deviceId, { color: Colors[theme].secondaryText }]}>
                            ID: ESP32-EB78C9D
                        </ThemedText>
                    </ThemedView>
                </Animated.View>

                <ThemedView
                    style={[styles.section, { backgroundColor: Colors[theme].cardBackground }, CommonStyles.shadow]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Configurações Gerais
                    </ThemedText>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Ativar Dispositivo</ThemedText>
                        <Switch
                            value={deviceEnabled}
                            onValueChange={handleDeviceToggle}
                            trackColor={{
                                false: Colors[theme].switchTrackInactive,
                                true: Colors[theme].switchTrackActive,
                            }}
                            thumbColor={
                                deviceEnabled ? Colors[theme].switchThumbActive : Colors[theme].switchThumbInactive
                            }
                        />
                    </ThemedView>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Notificar Contatos de Emergência</ThemedText>
                        <Switch
                            value={notifyContacts}
                            onValueChange={setNotifyContacts}
                            trackColor={{
                                false: Colors[theme].switchTrackInactive,
                                true: Colors[theme].switchTrackActive,
                            }}
                            thumbColor={
                                notifyContacts ? Colors[theme].switchThumbActive : Colors[theme].switchThumbInactive
                            }
                        />
                    </ThemedView>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Tema Escuro</ThemedText>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{
                                false: Colors[theme].switchTrackInactive,
                                true: Colors[theme].switchTrackActive,
                            }}
                            thumbColor={darkMode ? Colors[theme].switchThumbActive : Colors[theme].switchThumbInactive}
                        />
                    </ThemedView>
                </ThemedView>

                <ThemedView
                    style={[styles.section, { backgroundColor: Colors[theme].cardBackground }, CommonStyles.shadow]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Configurações de Alerta
                    </ThemedText>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Som de Alerta</ThemedText>
                        <Switch
                            value={soundEnabled}
                            onValueChange={setSoundEnabled}
                            trackColor={{
                                false: Colors[theme].switchTrackInactive,
                                true: Colors[theme].switchTrackActive,
                            }}
                            thumbColor={
                                soundEnabled ? Colors[theme].switchThumbActive : Colors[theme].switchThumbInactive
                            }
                        />
                    </ThemedView>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Vibração</ThemedText>
                        <Switch
                            value={vibrationEnabled}
                            onValueChange={setVibrationEnabled}
                            trackColor={{
                                false: Colors[theme].switchTrackInactive,
                                true: Colors[theme].switchTrackActive,
                            }}
                            thumbColor={
                                vibrationEnabled ? Colors[theme].switchThumbActive : Colors[theme].switchThumbInactive
                            }
                        />
                    </ThemedView>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Duração da Notificação (segundos)</ThemedText>
                        <ThemedView style={styles.durationInputContainer}>
                            <TouchableOpacity
                                style={styles.durationButton}
                                onPress={() => {
                                    const newValue = Math.max(0, parseInt(notificationDuration) - 10);
                                    handleChangeNotificationDuration(newValue.toString());
                                }}
                            >
                                <ThemedText style={styles.durationButtonText}>-</ThemedText>
                            </TouchableOpacity>

                            <AnimatedTextInput
                                style={[
                                    styles.input,
                                    {
                                        borderColor: Colors[theme].border,
                                        color: Colors[theme].text,
                                        backgroundColor: Colors[theme].background,
                                    },
                                ]}
                                value={notificationDuration}
                                onChangeText={handleChangeNotificationDuration}
                                keyboardType="number-pad"
                                maxLength={3}
                            />

                            <TouchableOpacity
                                style={styles.durationButton}
                                onPress={() => {
                                    const newValue = Math.min(300, parseInt(notificationDuration) + 10);
                                    handleChangeNotificationDuration(newValue.toString());
                                }}
                            >
                                <ThemedText style={styles.durationButtonText}>+</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.settingItem}>
                        <ThemedText>Número de Emergência</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: Colors[theme].border,
                                    color: Colors[theme].text,
                                    backgroundColor: Colors[theme].background,
                                },
                            ]}
                            value={emergencyNumber}
                            onChangeText={setEmergencyNumber}
                            keyboardType="number-pad"
                            maxLength={9}
                        />
                    </ThemedView>
                </ThemedView>

                <Collapsible title="Contatos de Emergência" expanded={contactExpanded} onToggle={handleToggleContacts}>
                    <ThemedView style={styles.contactList}>
                        {contacts.map((contact) => (
                            <Animated.View
                                key={contact.id}
                                entering={FadeIn.delay(contacts.findIndex((c) => c.id === contact.id) * 100)}
                                style={styles.contactItem}
                            >
                                <ThemedView style={styles.contactInfo}>
                                    <ThemedText type="defaultSemiBold">{contact.name}</ThemedText>
                                    <ThemedText>{contact.phone}</ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.contactActions}>
                                    <TouchableOpacity
                                        style={[styles.contactButton, { backgroundColor: Colors[theme].controlBg }]}
                                        onPress={() => {}}
                                    >
                                        <ThemedText style={[styles.contactButtonText, { color: Colors[theme].info }]}>
                                            Editar
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.contactButton, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
                                        onPress={() => handleRemoveContact(contact.id)}
                                    >
                                        <ThemedText style={{ color: Colors[theme].notification }}>Remover</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            </Animated.View>
                        ))}
                    </ThemedView>
                </Collapsible>

                <ThemedView style={styles.actionButtons}>
                    <Animated.View style={testButtonStyle}>
                        <TouchableOpacity
                            style={[
                                styles.testButton,
                                { backgroundColor: Colors[theme].tint },
                                CommonStyles.buttonShadow,
                            ]}
                            onPress={handleTestDevice}
                        >
                            <ThemedText style={styles.testButtonText}>Testar Dispositivo</ThemedText>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: Colors[theme].controlBg }]}
                        onPress={handleResetSettings}
                    >
                        <ThemedText style={[styles.resetButtonText, { color: Colors[theme].notification }]}>
                            Redefinir Configurações
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView style={styles.footer}>
                    <ThemedText style={[styles.footerText, { color: Colors[theme].secondaryText }]}>
                        Seizure Detector App v1.0
                    </ThemedText>
                    <ThemedText style={[styles.footerText, { color: Colors[theme].secondaryText }]}>
                        © 2025 UFPE Sistemas Embarcados
                    </ThemedText>
                </ThemedView>
            </ScrollView>

            {/* Alerta de teste */}
            <SeizureAlert visible={showTestAlert} onClose={() => setShowTestAlert(false)} seizureData={testAlertData} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginTop: 50,
        marginBottom: 20,
        alignItems: 'center',
    },
    deviceStatus: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    deviceImageContainer: {
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: 'rgba(74, 137, 243, 0.1)',
        padding: 8,
    },
    deviceImage: {
        width: 60,
        height: 60,
        marginRight: 16,
    },
    deviceInfo: {
        flex: 1,
        marginLeft: 16,
    },
    deviceId: {
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    durationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    durationButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(74, 137, 243, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A89F3',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 80,
        textAlign: 'center',
    },
    contactList: {
        paddingVertical: 8,
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    contactInfo: {
        flex: 1,
    },
    contactActions: {
        flexDirection: 'row',
        gap: 8,
    },
    contactButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    contactButtonText: {
        fontSize: 12,
    },
    addContactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 8,
        gap: 8,
    },
    addContactIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIcon: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtons: {
        gap: 12,
        marginBottom: 20,
    },
    testButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    testButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resetButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    resetButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        marginTop: 8,
        marginBottom: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        marginBottom: 4,
    },
});
