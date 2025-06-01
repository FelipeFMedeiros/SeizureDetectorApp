import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, CommonStyles } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
    const [connecting, setConnecting] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Animation values
    const pulseAnim = useSharedValue(1);
    const rotateAnim = useSharedValue(0);
    const connectionProgress = useSharedValue(0);
    const waveAnim = useSharedValue(0);

    // Animate the waves when the component mounts
    useEffect(() => {
        waveAnim.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1, // infinite
            true, // reverse
        );
    }, []);

    // Start the connection animation when connecting
    useEffect(() => {
        if (connecting) {
            // Pulse animation for the brain
            pulseAnim.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
                ),
                -1,
                true,
            );

            // Rotation animation for connection icon
            rotateAnim.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);

            // Progress bar animation
            connectionProgress.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });
        } else {
            // Reset animations
            pulseAnim.value = 1;
            rotateAnim.value = 0;
            connectionProgress.value = 0;
        }
    }, [connecting]);

    const handleConnect = () => {
        setConnecting(true);
        // Simular uma conexão
        setTimeout(() => {
            setConnecting(false);
            Alert.alert('Conexão estabelecida!', 'Seu dispositivo foi conectado com sucesso.', [
                {
                    text: 'OK',
                    onPress: () => router.push('/monitoring'),
                },
            ]);
        }, 2000);
    };

    // Animated styles
    const brainAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseAnim.value }],
        };
    });

    const rotateStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotateAnim.value}deg` }],
        };
    });

    const progressBarStyle = useAnimatedStyle(() => {
        return {
            width: `${connectionProgress.value * 100}%`,
            backgroundColor: interpolateColor(connectionProgress.value, [0, 0.5, 1], ['#FF9500', '#4A89F3', '#34C759']),
        };
    });

    const waveStyle1 = useAnimatedStyle(() => {
        return {
            opacity: interpolate(waveAnim.value, [0, 1], [0.6, 0.2]),
            transform: [{ scale: interpolate(waveAnim.value, [0, 1], [1, 1.4]) }],
        };
    });

    const waveStyle2 = useAnimatedStyle(() => {
        return {
            opacity: interpolate(waveAnim.value, [0, 1], [0.4, 0.1]),
            transform: [{ scale: interpolate(waveAnim.value, [0, 1], [1.2, 1.7]) }],
        };
    });

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: Colors.light.header, dark: Colors.dark.header }}
            headerImage={<Image source={require('@/assets/images/brain.png')} style={styles.headerImage} />}
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Detector de Crises Epiléticas</ThemedText>
                </ThemedView>

                <ThemedView style={styles.deviceContainer}>
                    {/* Ondas animadas em forma de círculo ao redor do ícone do cérebro */}
                    <Animated.View style={[styles.wave, waveStyle1]} />
                    <Animated.View style={[styles.wave, waveStyle2]} />

                    <Animated.View style={brainAnimStyle}>
                        <View style={styles.deviceImage}>
                            <Image
                                source={require('@/assets/images/brain-wave.png')}
                                style={styles.deviceImageContent}
                                contentFit="contain"
                            />
                        </View>
                    </Animated.View>
                </ThemedView>

                <ThemedView style={[styles.infoContainer, { backgroundColor: Colors[theme].lightTintBackground }]}>
                    <ThemedText type="subtitle">Como funciona:</ThemedText>
                    <ThemedText style={styles.infoText}>
                        Este aplicativo conecta-se ao seu dispositivo ESP32 para monitorar movimentos durante o sono e
                        detectar possíveis crises epiléticas. Quando uma crise é detectada, o dispositivo envia uma
                        notificação de emergência para os contatos cadastrados.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.statusContainer}>
                    <ThemedText type="defaultSemiBold">Status: </ThemedText>
                    <ThemedView
                        style={[
                            styles.statusIndicator,
                            { backgroundColor: connecting ? Colors[theme].warning : Colors[theme].notification },
                        ]}
                    />
                    <ThemedText>{connecting ? 'Conectando...' : 'Desconectado'}</ThemedText>
                </ThemedView>

                {connecting && (
                    <ThemedView style={styles.progressContainer}>
                        <ThemedView style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBar, progressBarStyle]} />
                        </ThemedView>
                        <ThemedView style={styles.connectionInfo}>
                            <ThemedText style={styles.connectionText}>
                                Estabelecendo conexão com o dispositivo
                            </ThemedText>
                            <Animated.View style={rotateStyle}>
                                <Image
                                    source={require('@/assets/images/device-status.png')}
                                    style={styles.syncIcon}
                                    contentFit="contain"
                                />
                            </Animated.View>
                        </ThemedView>
                    </ThemedView>
                )}

                <TouchableOpacity
                    style={[styles.connectButton, { backgroundColor: Colors[theme].tint }, CommonStyles.buttonShadow]}
                    onPress={handleConnect}
                    disabled={connecting}
                >
                    <ThemedText style={styles.buttonText}>
                        {connecting ? 'Conectando...' : 'Conectar Dispositivo'}
                    </ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.tip}>
                    Certifique-se de que o dispositivo está ligado e próximo ao seu smartphone.
                </ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
    },
    headerImage: {
        height: 220,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    deviceContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        position: 'relative',
    },
    wave: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#4A89F3',
        opacity: 0.3,
    },
    deviceImage: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
        width: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
    },
    deviceImageContent: {
        width: 140,
        height: 140,
    },
    infoContainer: {
        borderRadius: 12,
        padding: 16,
    },
    infoText: {
        marginTop: 8,
        lineHeight: 22,
    },
    connectButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressContainer: {
        width: '100%',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    connectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    connectionText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    syncIcon: {
        width: 18,
        height: 18,
    },
    tip: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
        color: '#8E8E93',
    },
});
