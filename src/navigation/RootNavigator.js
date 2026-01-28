import React from "react";
import {
    DarkTheme,
    DefaultTheme,
    NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import DetailsScreen from "../screens/DetailsScreen";
import PersonScreen from "../screens/PersonScreen";
import SeasonScreen from "../screens/SeasonScreen";
import { useTheme } from "../theme/ThemeProvider";
import { View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const { theme } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surfaceStrong,
                    borderTopColor: theme.colors.border,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarIcon: ({ color, size }) => {
                    const iconMap = {
                        Home: "film-outline",
                        Search: "search-outline",
                        Watchlist: "bookmark-outline",
                    };
                    return (
                        <Ionicons
                            name={iconMap[route.name] || "ellipse"}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Watchlist" component={WatchlistScreen} />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const { theme } = useTheme();
    const baseTheme = theme.mode === "light" ? DefaultTheme : DarkTheme;
    const navTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surfaceStrong,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.primary,
            notification: theme.colors.accent,
        },
    };
    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Tabs" component={MainTabs} />
                <Stack.Screen name="Details" component={DetailsScreen} />
                <Stack.Screen name="Person" component={PersonScreen} />
                <Stack.Screen name="Season" component={SeasonScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
