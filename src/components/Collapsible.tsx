import { PropsWithChildren, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


interface CollapsibleProps extends PropsWithChildren {
    title: string;
    expanded?: boolean;
    onToggle?: () => void;
}

export function Collapsible({ children, title, expanded, onToggle }: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(expanded || false);
    const theme = useColorScheme() ?? 'light';
    const rotate = useSharedValue(0);
    const height = useSharedValue(0);

    // Sincronizar o estado controlado externamente (se fornecido)
    useEffect(() => {
        if (expanded !== undefined && expanded !== isOpen) {
            setIsOpen(expanded);
        }
    }, [expanded]);

    // Animar quando o estado muda
    useEffect(() => {
        rotate.value = withTiming(isOpen ? 90 : 0, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        height.value = isOpen ? withSpring(1) : withTiming(0);
    }, [isOpen]);

    const toggleCollapsible = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) {
            onToggle();
        }
    };

    // Estilos animados
    const arrowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotate.value}deg` }],
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(height.value, [0, 0.5, 1], [0, 0.7, 1]);

        return {
            opacity,
            transform: [
                {
                    translateY: interpolate(height.value, [0, 1], [-10, 0]),
                },
            ],
        };
    });

    return (
        <ThemedView
            style={[
                styles.container,
                {
                    backgroundColor: isOpen ? Colors[theme].lightTintBackground : 'transparent',
                    borderRadius: 12,
                },
            ]}
        >
            <TouchableOpacity style={styles.heading} onPress={toggleCollapsible} activeOpacity={0.7}>
                <Animated.View style={arrowStyle}>
                    <IconSymbol name="chevron.right" size={18} weight="medium" color={Colors[theme].tint} />
                </Animated.View>

                <ThemedText type="defaultSemiBold" style={styles.title}>
                    {title}
                </ThemedText>
            </TouchableOpacity>

            {isOpen && (
                <Animated.View style={[styles.content, contentStyle]} layout={Layout}>
                    {children}
                </Animated.View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        padding: 12,
        overflow: 'hidden',
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
    },
    content: {
        marginTop: 12,
        marginLeft: 26,
    },
});
