const tintColorLight = '#4A89F3';
const tintColorDark = '#80B0FF';

export const Colors = {
    light: {
        text: '#000',
        secondaryText: '#8E8E93',
        background: '#F8F8F8',
        tint: tintColorLight,
        tabIconDefault: '#C0C0C0',
        tabIconSelected: tintColorLight,
        cardBackground: '#FFFFFF',
        border: '#E0E0E0',
        notification: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        info: '#007AFF',
        header: '#9FD5FF',
        inactiveControl: '#E1E1E1',
        controlBg: '#F0F0F0',
        switchTrackActive: '#81b0ff',
        switchTrackInactive: '#767577',
        switchThumbActive: tintColorLight,
        switchThumbInactive: '#f4f3f4',
        notificationUnread: '#007AFF',
        lightTintBackground: 'rgba(74, 137, 243, 0.1)', // Light blue background
        warningBackground: 'rgba(255, 149, 0, 0.1)', // Light orange background
        notificationBackground: 'rgba(255, 59, 48, 0.1)', // Light red background
        infoBackground: 'rgba(0, 122, 255, 0.1)', // Light info background
    },
    dark: {
        text: '#FFFFFF',
        secondaryText: '#A8A8A8',
        background: '#121212',
        tint: tintColorDark,
        tabIconDefault: '#5E5E5E',
        tabIconSelected: tintColorDark,
        cardBackground: '#1E1E1E',
        border: '#3A3A3C',
        notification: '#FF453A',
        warning: '#FF9F0A',
        success: '#30D158',
        info: '#0A84FF',
        header: '#1D3D47',
        inactiveControl: '#333333',
        controlBg: '#2C2C2C',
        switchTrackActive: '#5B8ED2',
        switchTrackInactive: '#4A4A4A',
        switchThumbActive: tintColorDark,
        switchThumbInactive: '#AFAFAF',
        notificationUnread: '#0A84FF',
        lightTintBackground: 'rgba(91, 142, 210, 0.2)', // Dark mode blue background
        warningBackground: 'rgba(255, 159, 10, 0.2)', // Dark mode orange background
        notificationBackground: 'rgba(255, 69, 58, 0.2)', // Dark mode red background
        infoBackground: 'rgba(10, 132, 255, 0.2)', // Dark mode info background
    },
};

// Common styles that can be reused across components
export const CommonStyles = {
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    card: (theme: 'light' | 'dark') => ({
        backgroundColor: Colors[theme].cardBackground,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    }),
    pill: (theme: 'light' | 'dark', color: string) => ({
        backgroundColor: color,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    }),
};
