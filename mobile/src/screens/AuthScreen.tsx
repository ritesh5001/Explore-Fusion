import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { AppUser, useLoginMutation, useRegisterMutation } from '../features/api';
import { colors } from '../theme/colors';

const GENDER_OPTIONS = [
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
];

export function AuthScreen({
  onAuthenticated,
  onBack,
}: {
  onAuthenticated: (token: string, user: AppUser) => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [error, setError] = useState('');
  const [register, registerState] = useRegisterMutation();
  const [login, loginState] = useLoginMutation();
  const loading = registerState.isLoading || loginState.isLoading;

  async function submit() {
    setError('');
    try {
      const response =
        mode === 'register'
          ? await register({ name, email, password, phone, homeCity, gender }).unwrap()
          : await login({ email, password }).unwrap();

      onAuthenticated(response.token, response.user);
    } catch (err) {
      const message =
        'data' in (err as { data?: { message?: string } })
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Authentication failed. Check the details and try again.');
    }
  }

  const selectedGenderLabel = GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? gender;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backRow}>
          <Text style={styles.backText}>← Back to home</Text>
        </TouchableOpacity>
      ) : null}

      <Text variant="labelLarge" style={styles.eyebrow}>
        {mode === 'register' ? 'Create account' : 'Welcome back'}
      </Text>
      <Text variant="headlineLarge" style={styles.title}>
        {mode === 'register' ? 'Find someone who travels like you.' : 'Log in to Explore Fusion'}
      </Text>
      <Text style={styles.body}>
        {mode === 'register'
          ? 'Interest-first matching for Indian travelers. Discovery and chat unlock after onboarding.'
          : 'Discovery, group trips, chat, and safety tools are ready for you.'}
      </Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(value) => setMode(value as 'register' | 'login')}
        buttons={[
          { value: 'register', label: 'Register' },
          { value: 'login', label: 'Login' },
        ]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode === 'register' ? (
        <>
          <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" />
          <View style={styles.row}>
            <TextInput
              label="Home city"
              value={homeCity}
              onChangeText={setHomeCity}
              mode="outlined"
              style={styles.grow}
            />
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.grow}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.genderSelector}
              onPress={() => setShowGenderPicker(!showGenderPicker)}
            >
              <Text style={styles.genderValue}>{selectedGenderLabel}</Text>
              <Text style={styles.genderArrow}>{showGenderPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showGenderPicker ? (
              <View style={styles.genderOptions}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.genderOption, opt.value === gender && styles.genderOptionSelected]}
                    onPress={() => {
                      setGender(opt.value);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        opt.value === gender && styles.genderOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </>
      ) : null}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
      />
      <Button
        mode="contained"
        buttonColor={colors.primary}
        loading={loading}
        onPress={submit}
        style={styles.button}
      >
        {mode === 'register' ? 'Create account →' : 'Log in →'}
      </Button>

      <Text style={styles.switchText}>
        {mode === 'register' ? 'Already have an account? ' : 'New here? '}
        <Text
          style={styles.switchLink}
          onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
        >
          {mode === 'register' ? 'Login' : 'Create account'}
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 14,
    padding: 20,
    backgroundColor: colors.background,
  },
  backRow: {
    marginBottom: 4,
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    lineHeight: 36,
  },
  body: {
    color: colors.muted,
    lineHeight: 22,
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: colors.dangerText,
    backgroundColor: colors.dangerBg,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  grow: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  genderValue: {
    fontSize: 14,
    color: colors.text,
  },
  genderArrow: {
    fontSize: 11,
    color: colors.muted,
  },
  genderOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  genderOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  button: {
    borderRadius: 8,
    marginTop: 4,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
  },
  switchLink: {
    color: colors.text,
    fontWeight: '700',
  },
});
