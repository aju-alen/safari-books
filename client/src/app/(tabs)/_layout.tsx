import {  FONTSIZE } from '@/constants/tokens';
import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MiniPlayer from '@/store/Miniplayer';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RevenueCatProvider } from '../../providers/RevenueCat';
import { useTheme } from '@/providers/ThemeProvider';
import { Platform } from 'react-native';

const TabsLayout = () => {
    const {theme} = useTheme()
    const isAndroid = Platform.OS === 'android';
    const pathname = usePathname();
    const isFullAudioPlayer = /\/play\//.test(pathname);

    const tabBarVisibleStyle = {
        position: 'absolute' as const,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 0,
        paddingTop: 8,
        backgroundColor: theme.background,
        ...(isAndroid && {
            height: 60,
        }),
    };

    return (
        <RevenueCatProvider>
        <View style={styles.container}>
            {/* Bottom Tab Navigator */}
            <Tabs screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarLabelStyle: {
                    fontSize: FONTSIZE.xSmall,
                    fontWeight: '500'
                },
                headerShown: false,
                tabBarStyle: isFullAudioPlayer
                    ? { display: 'none', height: 0, opacity: 0 }
                    : tabBarVisibleStyle,
            }}>
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarLabel: "Home",
                        tabBarIcon: () => <AntDesign name="home" size={24} color={theme.primary} />
                    }}
                />

                <Tabs.Screen
                    name="library"
                    options={{
                        tabBarLabel: "Library",
                        tabBarIcon: () => <Ionicons name="library-outline" size={24} color={theme.primary} />
                    }}
                />
                <Tabs.Screen
                    name="discover"
                    options={{
                        tabBarLabel: "Discover",
                        tabBarIcon: () => <AntDesign name="find" size={24} color={theme.primary} />
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarLabel: "Profile",
                        tabBarIcon: () => <MaterialCommunityIcons name="face-man-profile" size={24} color={theme.primary} />
                    }}
                />
            </Tabs>

            <MiniPlayer />
        </View>     
         </RevenueCatProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
});

export default TabsLayout;
