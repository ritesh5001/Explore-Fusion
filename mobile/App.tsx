import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { AppUser } from './src/features/api';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { PreferencesScreen } from './src/screens/PreferencesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PublicProfileScreen } from './src/screens/PublicProfileScreen';
import { SafetyScreen } from './src/screens/SafetyScreen';
import { TripsScreen } from './src/screens/TripsScreen';
import { store } from './src/store';
import { colors } from './src/theme/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  Chat: { matchId: string };
  PublicProfile: { userId: string };
};

export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Trips: undefined;
  Safety: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<AppUser | null>(null);

  function saveSession(nextToken: string, nextUser: AppUser) {
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    setToken('');
    setUser(null);
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <StatusBar style="dark" />
        {!token || !user ? (
          <AuthScreen onAuthenticated={saveSession} />
        ) : !user.onboardingCompleted ? (
          <PreferencesScreen token={token} onCompleted={setUser} />
        ) : (
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { color: colors.text, fontWeight: '800' } }}>
              <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                {() => (
                  <MainTabs
                    token={token}
                    user={user}
                    onLogout={logout}
                    onUserUpdated={setUser}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Chat" options={{ title: 'Chat' }}>
                {({ route, navigation }) => (
                  <ChatScreen
                    token={token}
                    currentUserId={user._id}
                    matchId={route.params.matchId}
                    onOpenProfile={(userId) => navigation.navigate('PublicProfile', { userId })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PublicProfile" options={{ title: 'Traveler profile' }}>
                {({ route, navigation }) => (
                  <PublicProfileScreen
                    token={token}
                    userId={route.params.userId}
                    onAfterLike={() => navigation.navigate('MainTabs')}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </PaperProvider>
    </ReduxProvider>
  );
}

function MainTabs({
  token,
  user,
  onLogout,
  onUserUpdated
}: {
  token: string;
  user: AppUser;
  onLogout: () => void;
  onUserUpdated: (user: AppUser) => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '900' }}>{route.name.slice(0, 1)}</Text>
      })}
    >
      <Tab.Screen name="Discover">
        {({ navigation }) => (
          <DiscoverScreen
            token={token}
            onOpenProfile={(userId) => navigation.getParent()?.navigate('PublicProfile', { userId })}
            onOpenMatches={() => navigation.navigate('Matches')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Matches">
        {({ navigation }) => (
          <MatchesScreen
            token={token}
            currentUserId={user._id}
            onOpenChat={(matchId) => navigation.getParent()?.navigate('Chat', { matchId })}
            onOpenProfile={(userId) => navigation.getParent()?.navigate('PublicProfile', { userId })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Trips">{() => <TripsScreen token={token} />}</Tab.Screen>
      <Tab.Screen name="Safety">{() => <SafetyScreen token={token} />}</Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <ProfileScreen token={token} onLogout={onLogout} onUserUpdated={onUserUpdated} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
