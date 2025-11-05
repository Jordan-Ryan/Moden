import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ActivityScreen from '../screens/ActivityScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import { Activity } from '../utils/healthKit';

export type ActivityStackParamList = {
  ActivityList: undefined;
  ActivityDetail: {
    activity: Activity;
  };
};

const Stack = createStackNavigator<ActivityStackParamList>();

export default function ActivityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="ActivityList" component={ActivityScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
}
