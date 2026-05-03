import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { AppUser, useLoginMutation, useRegisterMutation } from '../features/api';
import { colors } from '../theme/colors';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (token: string, user: AppUser) => void }) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('Ritesh Sharma');
  const [email, setEmail] = useState('ritesh@example.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('Mumbai');
  const [error, setError] = useState('');
  const [register, registerState] = useRegisterMutation();
  const [login, loginState] = useLoginMutation();
  const loading = registerState.isLoading || loginState.isLoading;

  async function submit() {
    try {
      const response =
        mode === 'register'
          ? await register({
              name,
              email,
              password,
              phone,
              homeCity,
              gender: 'prefer-not-to-say'
            }).unwrap()
          : await login({ email, password }).unwrap();

      onAuthenticated(response.token, response.user);
    } catch {
      setError('Authentication failed. Check the details and try again.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        Login required
      </Text>
      <Text variant="headlineLarge" style={styles.title}>
        Create your account before matching.
      </Text>
      <Text style={styles.body}>
        Discovery, group trips, chat, and safety tools unlock only after login and travel preference onboarding.
      </Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(value) => setMode(value as 'register' | 'login')}
        buttons={[
          { value: 'register', label: 'Register' },
          { value: 'login', label: 'Login' }
        ]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode === 'register' ? (
        <>
          <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" />
          <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" />
          <TextInput label="Home city" value={homeCity} onChangeText={setHomeCity} mode="outlined" />
        </>
      ) : null}
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry />
      <Button mode="contained" buttonColor={colors.primary} loading={loading} onPress={submit} style={styles.button}>
        {mode === 'register' ? 'Create account' : 'Login'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 14,
    padding: 20,
    backgroundColor: colors.background
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800'
  },
  title: {
    color: colors.text,
    fontWeight: '900'
  },
  body: {
    color: colors.muted,
    lineHeight: 22
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: '#7a2c19',
    backgroundColor: '#fff0e9',
    fontWeight: '800'
  },
  button: {
    borderRadius: 8,
    marginTop: 4
  }
});
