import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootTabs } from './src/navigation/RootTabs';
import { theme } from './src/theme/theme';
import { View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

