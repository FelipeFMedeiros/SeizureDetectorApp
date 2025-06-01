import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Collapsible } from '@/components/Collapsible';
import { SeizureAlert } from '@/components/SeizureAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, CommonStyles } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

// Dados simulados do gráfico
const waveData = Array.from({ length: 60 }, (_, i) => {
    // Criar uma onda senoidal com alguma variação aleatória
    const baseValue = Math.sin(i * 0.2) * 20;
    const randomVariation = Math.random() * 5;
    return {
        value: baseValue + randomVariation + 30, // Manter valores positivos
        timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
    };
});

// Dias com eventos simulados
type CalendarEvent = { type: string; count: number };
const mockCalendarData: { [date: string]: CalendarEvent } = {
    '2025-05-01': { type: 'seizure', count: 1 },
    '2025-05-03': { type: 'restless', count: 1 },
    '2025-05-07': { type: 'normal', count: 1 },
    '2025-05-12': { type: 'restless', count: 1 },
    '2025-05-15': { type: 'seizure', count: 2 },
    '2025-05-19': { type: 'normal', count: 1 },
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function MonitoringScreen() {
    const [activeTab, setActiveTab] = useState('realtime');
    const [selectedMonth] = useState('Maio 2025');
    const [showAlert, setShowAlert] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Animation values for the live graph
    const graphProgress = useSharedValue(0);
    const graphHeight = useSharedValue(waveData[waveData.length - 1].value);

    // Animation for "live" effect
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulação de novos dados chegando
            graphHeight.value = withSequence(
                withTiming(30 + Math.random() * 20, { duration: 300 }),
                withTiming(30 + Math.random() * 5, { duration: 300 }),
            );
        }, 600);

        // Animate the progress bar
        graphProgress.value = withRepeat(withTiming(1, { duration: 15000, easing: Easing.linear }), -1, false);

        // Simulação aleatória de detecção de crise (apenas para demonstração)
        const alertTimeout = setTimeout(() => {
            if (Math.random() > 0.5) {
                setShowAlert(true);
            }
        }, 8000);

        return () => {
            clearInterval(interval);
            clearTimeout(alertTimeout);
        };
    }, []);

    // Animated styles
    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${graphProgress.value * 100}%`,
            backgroundColor: Colors[theme].tint,
        };
    });

    const graphLineStyle = useAnimatedStyle(() => {
        return {
            height: graphHeight.value,
        };
    });

    const renderCalendarDay = (day: number) => {
        const dateString = `2025-05-${day.toString().padStart(2, '0')}`;
        const dayData = mockCalendarData[dateString];

        let backgroundColor = 'transparent';
        let dotColor = null;

        if (dayData) {
            if (dayData.type === 'seizure') {
                dotColor = Colors[theme].notification;
            } else if (dayData.type === 'restless') {
                dotColor = Colors[theme].warning;
            } else if (dayData.type === 'normal') {
                dotColor = Colors[theme].success;
            }
        }

        return (
            <TouchableOpacity
                key={day}
                style={[styles.calendarDay, { backgroundColor }]}
                onPress={() => {
                    if (dayData) {
                        alert(
                            `${day} de Maio: ${dayData.count} ${
                                dayData.type === 'seizure'
                                    ? 'crise(s) detectada(s)'
                                    : dayData.type === 'restless'
                                    ? 'noite(s) agitada(s)'
                                    : 'noite(s) tranquila(s)'
                            }`,
                        );
                    }
                }}
            >
                <ThemedText style={styles.calendarDayText}>{day}</ThemedText>
                {dotColor && <ThemedView style={[styles.calendarDot, { backgroundColor: dotColor }]} />}
            </TouchableOpacity>
        );
    };

    // Simulated seizure data for the alert
    const seizureData = {
        startTime: '15:32:45',
        duration: 48,
        intensity: 'Moderada' as const,
    };

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">Monitoramento</ThemedText>
                </ThemedView>

                <ThemedView style={styles.tabButtons}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            {
                                backgroundColor:
                                    activeTab === 'realtime' ? Colors[theme].tint : Colors[theme].inactiveControl,
                            },
                        ]}
                        onPress={() => setActiveTab('realtime')}
                    >
                        <ThemedText
                            style={[
                                styles.tabButtonText,
                                { color: activeTab === 'realtime' ? 'white' : Colors[theme].text },
                            ]}
                        >
                            Tempo Real
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            {
                                backgroundColor:
                                    activeTab === 'calendar' ? Colors[theme].tint : Colors[theme].inactiveControl,
                            },
                        ]}
                        onPress={() => setActiveTab('calendar')}
                    >
                        <ThemedText
                            style={[
                                styles.tabButtonText,
                                { color: activeTab === 'calendar' ? 'white' : Colors[theme].text },
                            ]}
                        >
                            Calendário
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {activeTab === 'realtime' ? (
                    <ThemedView style={styles.realtimeContainer}>
                        <ThemedView style={[styles.graphContainer, CommonStyles.shadow]}>
                            <ThemedView style={styles.graphHeader}>
                                <ThemedText type="subtitle" style={styles.graphTitle}>
                                    Movimentos Detectados
                                </ThemedText>
                                <ThemedView style={styles.liveIndicator}>
                                    <ThemedView style={styles.liveIndicatorDot} />
                                    <ThemedText style={styles.liveText}>AO VIVO</ThemedText>
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={styles.graphWrapper}>
                                {/* Gráfico Simulado Animado */}
                                <ThemedView style={styles.graphYAxis}>
                                    <ThemedText style={styles.axisLabel}>60</ThemedText>
                                    <ThemedText style={styles.axisLabel}>40</ThemedText>
                                    <ThemedText style={styles.axisLabel}>20</ThemedText>
                                    <ThemedText style={styles.axisLabel}>0</ThemedText>
                                </ThemedView>

                                <ThemedView style={styles.graphContent}>
                                    {/* Linhas de grade */}
                                    <ThemedView style={styles.gridLine} />
                                    <ThemedView style={[styles.gridLine, { top: '25%' }]} />
                                    <ThemedView style={[styles.gridLine, { top: '50%' }]} />
                                    <ThemedView style={[styles.gridLine, { top: '75%' }]} />

                                    {/* Barras do gráfico */}
                                    {waveData.map((data, index) => (
                                        <ThemedView
                                            key={index}
                                            style={[
                                                styles.graphBar,
                                                {
                                                    left: `${(index / waveData.length) * 100}%`,
                                                    height: data.value,
                                                    backgroundColor:
                                                        index === waveData.length - 1
                                                            ? Colors[theme].tint
                                                            : data.value > 40
                                                            ? Colors[theme].warning
                                                            : data.value > 30
                                                            ? Colors[theme].info
                                                            : '#A4A4A4',
                                                },
                                            ]}
                                        />
                                    ))}

                                    {/* Linha animada no final */}
                                    <Animated.View
                                        style={[
                                            styles.graphBar,
                                            {
                                                left: '98%',
                                                backgroundColor:
                                                    graphHeight.value > 40 ? Colors[theme].warning : Colors[theme].info,
                                            },
                                            graphLineStyle,
                                        ]}
                                    />
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={styles.graphXAxis}>
                                <ThemedText style={styles.axisLabel}>-60s</ThemedText>
                                <ThemedText style={styles.axisLabel}>-30s</ThemedText>
                                <ThemedText style={styles.axisLabel}>Agora</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.progressContainer}>
                                <ThemedText style={styles.progressLabel}>Atualização</ThemedText>
                                <ThemedView style={styles.progressBar}>
                                    <Animated.View style={[styles.progress, progressStyle]} />
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>

                        <Collapsible title="Estatísticas de Hoje">
                            <ThemedView style={styles.statsContainer}>
                                <ThemedView style={styles.statItem}>
                                    <ThemedText type="defaultSemiBold">Movimentos:</ThemedText>
                                    <ThemedText>78 (Normal)</ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.statItem}>
                                    <ThemedText type="defaultSemiBold">Pico de Atividade:</ThemedText>
                                    <ThemedText>23:45 - 00:15</ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.statItem}>
                                    <ThemedText type="defaultSemiBold">Duração do Sono:</ThemedText>
                                    <ThemedText>7h 23min</ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.statItem}>
                                    <ThemedText type="defaultSemiBold">Qualidade:</ThemedText>
                                    <ThemedView style={styles.qualityIndicator}>
                                        <ThemedView
                                            style={[
                                                styles.qualityBar,
                                                { backgroundColor: Colors[theme].success, width: '75%' },
                                            ]}
                                        />
                                    </ThemedView>
                                </ThemedView>
                            </ThemedView>
                        </Collapsible>

                        <Collapsible title="Último Alerta">
                            <ThemedView
                                style={[styles.alertContainer, { borderLeftColor: Colors[theme].notification }]}
                            >
                                <ThemedView style={styles.alertHeader}>
                                    <ThemedText type="defaultSemiBold" style={styles.alertDate}>
                                        15/05/2025 - 02:34
                                    </ThemedText>
                                    <ThemedView
                                        style={[styles.alertBadge, { backgroundColor: Colors[theme].notification }]}
                                    >
                                        <ThemedText style={styles.alertBadgeText}>Crise Leve</ThemedText>
                                    </ThemedView>
                                </ThemedView>
                                <ThemedText style={styles.alertDescription}>
                                    Movimento rítmico detectado com duração de 47 segundos. Vibrações compatíveis com
                                    crise mioclônica leve.
                                </ThemedText>
                                <TouchableOpacity
                                    style={[styles.alertButton, { backgroundColor: Colors[theme].notification }]}
                                >
                                    <ThemedText style={styles.alertButtonText}>Ver Detalhes</ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        </Collapsible>
                    </ThemedView>
                ) : (
                    <ThemedView style={[styles.calendarContainer, CommonStyles.shadow]}>
                        <ThemedView style={styles.monthSelector}>
                            <TouchableOpacity>
                                <ThemedText style={[styles.monthArrow, { color: Colors[theme].tint }]}>←</ThemedText>
                            </TouchableOpacity>
                            <ThemedText type="subtitle">{selectedMonth}</ThemedText>
                            <TouchableOpacity>
                                <ThemedText style={[styles.monthArrow, { color: Colors[theme].tint }]}>→</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={styles.calendarWeekdays}>
                            {weekDays.map((day) => (
                                <ThemedText key={day} style={styles.weekdayText}>
                                    {day}
                                </ThemedText>
                            ))}
                        </ThemedView>

                        <ThemedView style={styles.calendarGrid}>
                            {/* Dias vazios para alinhar com o dia da semana */}
                            {[...Array(3)].map((_, index) => (
                                <ThemedView key={`empty-${index}`} style={styles.calendarDay} />
                            ))}

                            {/* Dias do mês */}
                            {monthDays.map(renderCalendarDay)}
                        </ThemedView>

                        <ThemedView style={styles.legendContainer}>
                            <ThemedText type="subtitle">Legenda:</ThemedText>
                            <ThemedView style={styles.legendItem}>
                                <ThemedView
                                    style={[styles.legendDot, { backgroundColor: Colors[theme].notification }]}
                                />
                                <ThemedText>Crise Detectada</ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.legendItem}>
                                <ThemedView style={[styles.legendDot, { backgroundColor: Colors[theme].warning }]} />
                                <ThemedText>Sono Agitado</ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.legendItem}>
                                <ThemedView style={[styles.legendDot, { backgroundColor: Colors[theme].success }]} />
                                <ThemedText>Sono Normal</ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                )}
            </ScrollView>

            {/* Alerta de Crise */}
            <SeizureAlert visible={showAlert} onClose={() => setShowAlert(false)} seizureData={seizureData} />
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
    tabButtons: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabButtonText: {
        fontWeight: '600',
    },
    realtimeContainer: {
        gap: 16,
    },
    graphContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    graphHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    graphTitle: {
        alignSelf: 'flex-start',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    liveIndicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
    },
    liveText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    graphWrapper: {
        width: '100%',
        height: 180,
        flexDirection: 'row',
        marginBottom: 10,
    },
    graphYAxis: {
        width: 30,
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    graphContent: {
        flex: 1,
        height: '100%',
        position: 'relative',
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E1E1E1',
    },
    graphXAxis: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 30,
        marginBottom: 15,
    },
    axisLabel: {
        fontSize: 10,
        color: '#8E8E93',
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressLabel: {
        fontSize: 12,
        color: '#8E8E93',
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E1E1E1',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    graphBar: {
        position: 'absolute',
        width: 2,
        bottom: 0,
    },
    statsContainer: {
        gap: 12,
        paddingVertical: 8,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    qualityIndicator: {
        width: 100,
        height: 8,
        backgroundColor: '#E1E1E1',
        borderRadius: 4,
        overflow: 'hidden',
    },
    qualityBar: {
        height: '100%',
        borderRadius: 4,
    },
    alertContainer: {
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        borderLeftWidth: 4,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    alertDate: {
        fontSize: 14,
    },
    alertBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    alertBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    alertDescription: {
        marginBottom: 10,
    },
    alertButton: {
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    alertButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthArrow: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    calendarWeekdays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    weekdayText: {
        fontWeight: 'bold',
        width: width / 9,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    calendarDay: {
        width: width / 9,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        position: 'relative',
    },
    calendarDayText: {
        textAlign: 'center',
    },
    calendarDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        bottom: 2,
    },
    legendContainer: {
        marginTop: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
});
