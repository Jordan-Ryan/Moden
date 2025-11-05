import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TodayScreen from './screens/TodayScreen';
import SettingsScreen from './screens/SettingsScreen';
import ActivityStack from './navigation/ActivityStack';
import TabIcon from './components/TabIcon';
import { HealthProvider } from './context/HealthContext';
import GlassTabBar from './components/GlassTabBar';

const Tab = createBottomTabNavigator();

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',
    card: '#111',
    text: '#fff',
    border: '#1f1f1f',
    primary: '#f5f5f5',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <HealthProvider>
        <NavigationContainer theme={darkTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#ffffff',
              tabBarInactiveTintColor: '#9a9a9a',
            }}
            sceneContainerStyle={{ backgroundColor: '#000' }}
            tabBar={(props) => <GlassTabBar {...props} />}
          >
            <Tab.Screen 
              name="Today" 
              component={TodayScreen}
              options={{ tabBarIcon: ({ color }) => <TabIcon name="today" color={color} /> }}
            />
            <Tab.Screen 
              name="Activity" 
              component={ActivityStack}
              options={{ tabBarIcon: ({ color }) => <TabIcon name="activity" color={color} /> }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} /> }}
            />
          </Tab.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </HealthProvider>
    </SafeAreaProvider>
  );
}
