import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text } from 'react-native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { AppUser } from './src/features/api';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { HomeScreen } from './src/screens/HomeScreen';
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

const TAB_ICONS: Record<string, string> = {
  Discover: '🔍',
  Matches: '❤️',
  Trips: '✈️',
  Safety: '🛡️',
  Profile: '👤',
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const paperTheme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.text,
    tertiary: colors.text,
    background: colors.background,
    surface: colors.card,
    surfaceVariant: colors.surface,
    outline: colors.border,
    outlineVariant: colors.border,
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: colors.text,
    onSurfaceVariant: colors.muted,
    error: colors.dangerText,
    errorContainer: colors.dangerBg,
  },
};

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<AppUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  function saveSession(nextToken: string, nextUser: AppUser) {
    setToken(nextToken);
    setUser(nextUser);
    setShowAuth(false);
  }

  function logout() {
    setToken('');
    setUser(null);
    setShowAuth(false);
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="dark" />
        {!token || !user ? (
          showAuth ? (
            <AuthScreen onAuthenticated={saveSession} onBack={() => setShowAuth(false)} />
          ) : (
            <HomeScreen onGetStarted={() => setShowAuth(true)} />
          )
        ) : !user.onboardingCompleted ? (
          <PreferencesScreen token={token} onCompleted={setUser} />
        ) : (
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTitleStyle: { color: colors.text, fontWeight: '800' },
              }}
            >
              <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                {() => (
                  <MainTabs token={token} user={user} onLogout={logout} onUserUpdated={setUser} />
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
  onUserUpdated,
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
        tabBarIcon: () => (
          <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name] ?? route.name.slice(0, 1)}</Text>
        ),
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
            onPlanTrip={() => navigation.navigate('Trips')}
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
