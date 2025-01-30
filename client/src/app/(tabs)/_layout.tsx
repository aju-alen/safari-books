import { COLORS, FONTSIZE } from '@/constants/tokens';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MiniPlayer from '@/store/Miniplayer';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet } from 'react-native';

const TabsLayout = () => {
    return (
        <View style={styles.container}>
            {/* Bottom Tab Navigator */}
            <Tabs screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarLabelStyle: {
                    fontSize: FONTSIZE.xSmall,
                    fontWeight: '500'
                },
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderTopWidth: 0,
                    paddingTop: 8,
                    backgroundColor: COLORS.background,
                },
            }}>
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarLabel: "Home",
                        tabBarIcon: () => <AntDesign name="home" size={24} color={COLORS.primary} />
                    }}
                />

                <Tabs.Screen
                    name="library"
                    options={{
                        tabBarLabel: "Library",
                        tabBarIcon: () => <Ionicons name="library-outline" size={24} color={COLORS.primary} />
                    }}
                />
                <Tabs.Screen
                    name="discover"
                    options={{
                        tabBarLabel: "Discover",
                        tabBarIcon: () => <AntDesign name="find" size={24} color={COLORS.primary} />
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarLabel: "Profile",
                        tabBarIcon: () => <MaterialCommunityIcons name="face-man-profile" size={24} color={COLORS.primary} />
                    }}
                />
            </Tabs>

            {/* Mini Player Positioned on Top of the Tabs */}
            <MiniPlayer style={styles.miniPlayer} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    miniPlayer: {
        position: 'absolute',
        bottom: 100, // Adjust based on tab bar height
        left: 0,
        right: 0,
        zIndex: 10, // Ensure it overlays the tabs
    }
});

export default TabsLayout;
