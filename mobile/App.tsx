import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { AppUser } from './src/features/api';
import { AuthScreen } from './src/screens/AuthScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { PreferencesScreen } from './src/screens/PreferencesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SafetyScreen } from './src/screens/SafetyScreen';
import { TripsScreen } from './src/screens/TripsScreen';
import { store } from './src/store';
import { colors } from './src/theme/colors';

export type RootTabParamList = {
  Discover: undefined;
  Trips: undefined;
  Safety: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<AppUser | null>(null);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <StatusBar style="dark" />
        {!token || !user ? (
          <AuthScreen
            onAuthenticated={(nextToken, nextUser) => {
              setToken(nextToken);
              setUser(nextUser);
            }}
          />
        ) : !user.onboardingCompleted ? (
          <PreferencesScreen token={token} onCompleted={setUser} />
        ) : (
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.background },
                headerTitleStyle: { color: colors.text, fontWeight: '800' },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontWeight: '900' }}>{route.name.slice(0, 1)}</Text>
                )
              })}
            >
              <Tab.Screen name="Discover">{() => <DiscoverScreen token={token} />}</Tab.Screen>
              <Tab.Screen name="Trips">{() => <TripsScreen token={token} />}</Tab.Screen>
              <Tab.Screen name="Safety" component={SafetyScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        )}
      </PaperProvider>
    </ReduxProvider>
  );
}
