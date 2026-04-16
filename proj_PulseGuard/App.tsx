import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { Theme } from './src/constants/Theme';

// 页面导入
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DataEntryScreen } from './src/screens/DataEntryScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

// 关键修复
enableScreens(false);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === '首页') iconName = 'home';
            else if (route.name === '录入') iconName = 'add-circle';
            else if (route.name === '趋势') iconName = 'stats-chart';
            else if (route.name === '历史') iconName = 'list';
            else if (route.name === '设置') iconName = 'settings';

            return <Ionicons name={iconName} size={30} color={color} />;
          },
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textSecondary,
          tabBarStyle: {
            height: 85,
            paddingBottom: 20,
            paddingTop: 10,
          },
        })}
      >
        <Tab.Screen name="首页" component={DashboardScreen} />
        <Tab.Screen name="录入" component={DataEntryScreen} />
        <Tab.Screen name="历史" component={HistoryScreen} />
        <Tab.Screen name="趋势" component={ReportsScreen} />
        <Tab.Screen name="设置" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
