import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, CommonStyles } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Dados simulados de notificações
interface Notification {
    id: string;
    type: 'seizure' | 'warning' | 'info';
    title: string;
    description: string;
    date: string;
    time: string;
    read: boolean;
}

const NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'seizure',
        title: 'Crise Epilética Detectada',
        description: 'Crise detectada com duração de 1 minuto e 12 segundos.',
        date: '15/05/2025',
        time: '02:34',
        read: false,
    },
    {
        id: '2',
        type: 'warning',
        title: 'Sono Agitado',
        description: 'Movimentos frequentes detectados durante a noite. Qualidade do sono comprometida.',
        date: '12/05/2025',
        time: '08:15',
        read: true,
    },
    {
        id: '3',
        type: 'info',
        title: 'Bateria Baixa',
        description: 'A bateria do seu dispositivo está com menos de 20%. Conecte o carregador.',
        date: '10/05/2025',
        time: '22:45',
        read: true,
    },
    {
        id: '4',
        type: 'seizure',
        title: 'Crise Epilética Detectada',
        description: 'Crise leve detectada com duração de 42 segundos.',
        date: '03/05/2025',
        time: '03:17',
        read: true,
    },
    {
        id: '5',
        type: 'info',
        title: 'Sem Atividade',
        description:
            'Nenhuma atividade detectada nas últimas 48 horas. Verifique se o dispositivo está posicionado corretamente.',
        date: '01/05/2025',
        time: '10:30',
        read: true,
    },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Animation value for new notification indication
    const newNotificationScale = useSharedValue(1);

    useEffect(() => {
        // Animação pulsante para a notificação não lida
        if (notifications.some((n) => !n.read)) {
            newNotificationScale.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
        }
    }, [newNotificationScale, notifications]);

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification,
            ),
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((notification) => notification.id !== id));
    };

    const handleFilterChange = (filter: string | null) => {
        setActiveFilter(filter === activeFilter ? null : filter);
    };

    const toggleExpand = (id: string) => {
        setExpandedNotification(expandedNotification === id ? null : id);
    };

    const filteredNotifications = activeFilter
        ? notifications.filter((notification) => notification.type === activeFilter)
        : notifications;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'seizure':
                return require('@/assets/images/brain-alert.png');
            case 'warning':
                return require('@/assets/images/warning.png');
            case 'info':
                return require('@/assets/images/info.png');
            default:
                return require('@/assets/images/notification.png');
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'seizure':
                return Colors[theme].notification;
            case 'warning':
                return Colors[theme].warning;
            case 'info':
                return Colors[theme].info;
            default:
                return Colors[theme].secondaryText;
        }
    };

    // Animation style for unread notifications
    const newNotificationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: newNotificationScale.value }],
        };
    });

const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => {
    const isExpanded = expandedNotification === item.id;

    return (
        <Animated.View
            entering={SlideInRight.delay(index * 100)}
            layout={Layout.springify()}
            style={[
                styles.notificationItem,
                { backgroundColor: Colors[theme].cardBackground },
                !item.read && {
                    borderLeftWidth: 4,
                    borderLeftColor: Colors[theme].notificationUnread,
                },
                CommonStyles.shadow,
            ]}
        >
                <TouchableOpacity
                    style={styles.notificationContent}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.9}
                >
                    <View
                        style={[styles.notificationIconContainer, { backgroundColor: getNotificationColor(item.type) }]}
                    >
                        <Image
                            source={getNotificationIcon(item.type)}
                            style={styles.notificationIcon}
                            contentFit="contain"
                        />
                    </View>

                    <ThemedView style={styles.notificationTextContent}>
                        <ThemedView style={styles.notificationHeader}>
                            <ThemedView style={styles.titleContainer}>
                                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                                    {item.title}
                                </ThemedText>
                                {!item.read && <Animated.View style={[styles.unreadDot, newNotificationStyle]} />}
                            </ThemedView>
                            <ThemedView style={styles.notificationTime}>
                                <ThemedText style={styles.timeText}>{item.date}</ThemedText>
                                <ThemedText style={styles.timeText}>{item.time}</ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedText style={styles.notificationDescription} numberOfLines={isExpanded ? undefined : 2}>
                            {item.description}
                        </ThemedText>
                    </ThemedView>
                </TouchableOpacity>

                {isExpanded && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.notificationActions}>
                        {!item.read && (
                            <AnimatedTouchableOpacity
                                entering={FadeIn.delay(50)}
                                style={[styles.actionButton, styles.readButton]}
                                onPress={() => markAsRead(item.id)}
                            >
                                <ThemedText style={styles.actionButtonText}>Marcar como lida</ThemedText>
                            </AnimatedTouchableOpacity>
                        )}
                        <AnimatedTouchableOpacity
                            entering={FadeIn.delay(100)}
                            style={[styles.actionButton, styles.detailsButton]}
                            onPress={() => alert(`Detalhes da notificação: ${item.title}`)}
                        >
                            <ThemedText style={styles.actionButtonText}>Ver detalhes</ThemedText>
                        </AnimatedTouchableOpacity>
                        <AnimatedTouchableOpacity
                            entering={FadeIn.delay(150)}
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => deleteNotification(item.id)}
                        >
                            <ThemedText style={styles.actionButtonText}>Excluir</ThemedText>
                        </AnimatedTouchableOpacity>
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    // Header com animação dos filtros
    const renderHeader = () => (
        <>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Notificações</ThemedText>
                {notifications.length > 0 && (
                    <TouchableOpacity
                        style={[styles.clearAllButton, { backgroundColor: Colors[theme].controlBg }]}
                        onPress={() => setNotifications([])}
                    >
                        <ThemedText style={[styles.clearAllText, { color: Colors[theme].secondaryText }]}>
                            Limpar tudo
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ThemedView>

            <ThemedView style={styles.filtersContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        activeFilter === 'seizure' && { backgroundColor: Colors[theme].notification },
                    ]}
                    onPress={() => handleFilterChange('seizure')}
                >
                    <ThemedView
                        style={[
                            styles.filterDot,
                            { backgroundColor: activeFilter === 'seizure' ? 'white' : Colors[theme].notification },
                        ]}
                    />
                    <ThemedText style={[styles.filterText, activeFilter === 'seizure' && { color: 'white' }]}>
                        Crises
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        activeFilter === 'warning' && { backgroundColor: Colors[theme].warning },
                    ]}
                    onPress={() => handleFilterChange('warning')}
                >
                    <ThemedView
                        style={[
                            styles.filterDot,
                            { backgroundColor: activeFilter === 'warning' ? 'white' : Colors[theme].warning },
                        ]}
                    />
                    <ThemedText style={[styles.filterText, activeFilter === 'warning' && { color: 'white' }]}>
                        Alertas
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'info' && { backgroundColor: Colors[theme].info }]}
                    onPress={() => handleFilterChange('info')}
                >
                    <ThemedView
                        style={[
                            styles.filterDot,
                            { backgroundColor: activeFilter === 'info' ? 'white' : Colors[theme].info },
                        ]}
                    />
                    <ThemedText style={[styles.filterText, activeFilter === 'info' && { color: 'white' }]}>
                        Informações
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            {renderHeader()}

            {filteredNotifications.length > 0 ? (
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.notificationsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <ThemedView style={styles.emptyContainer}>
                    <Image
                        source={require('@/assets/images/notification.png')}
                        style={styles.emptyImage}
                        contentFit="contain"
                    />
                    <ThemedText type="subtitle" style={styles.emptyText}>
                        {activeFilter
                            ? `Sem notificações do tipo ${
                                  activeFilter === 'seizure'
                                      ? 'crises'
                                      : activeFilter === 'warning'
                                      ? 'alertas'
                                      : 'informações'
                              }`
                            : 'Sem notificações'}
                    </ThemedText>
                    <ThemedText style={styles.emptySubtext}>
                        {activeFilter
                            ? 'Tente selecionar outro filtro ou limpar os filtros.'
                            : 'As notificações aparecerão aqui quando houver alertas do seu dispositivo.'}
                    </ThemedText>
                </ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    clearAllText: {
        fontSize: 12,
    },
    filtersContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(142, 142, 147, 0.12)',
        marginRight: 8,
    },
    filterDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
    },
    notificationsList: {
        paddingBottom: 20,
    },
    notificationItem: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    notificationContent: {
        flexDirection: 'row',
        padding: 12,
    },
    notificationIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    notificationTextContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    notificationTime: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: 12,
        color: '#8E8E93',
    },
    notificationDescription: {
        marginBottom: 10,
        fontSize: 14,
    },
    notificationActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    actionButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    readButton: {
        backgroundColor: '#E9E9EB',
    },
    detailsButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.12)',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.12)',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 50,
    },
    emptyImage: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    emptyText: {
        marginBottom: 8,
    },
    emptySubtext: {
        textAlign: 'center',
        color: '#8E8E93',
    },
});
