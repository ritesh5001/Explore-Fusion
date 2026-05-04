import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { AppUser, useCompleteOnboardingMutation } from '../features/api';
import { colors } from '../theme/colors';

export function PreferencesScreen({
  token,
  onCompleted
}: {
  token: string;
  onCompleted: (user: AppUser) => void;
}) {
  const [bio, setBio] = useState('I like planned trips with local food, safe stays, and flexible daytime activities.');
  const [travelStyle, setTravelStyle] = useState('budget');
  const [interests, setInterests] = useState('Hiking, Food & Cuisine, Culture & History, Photography');
  const [languages, setLanguages] = useState('English, Hindi');
  const [budgetMin, setBudgetMin] = useState('1500');
  const [budgetMax, setBudgetMax] = useState('5000');
  const [dreamDestinations, setDreamDestinations] = useState('Bali, Vietnam, Jaipur');
  const [tripDestination, setTripDestination] = useState('Bali');
  const [startDate, setStartDate] = useState('2026-07-04');
  const [endDate, setEndDate] = useState('2026-07-16');
  const [error, setError] = useState('');
  const [completeOnboarding, state] = useCompleteOnboardingMutation();

  async function submit() {
    try {
      const user = await completeOnboarding({
        token,
        input: {
          bio,
          travelStyle,
          interests: splitTags(interests),
          languages: splitTags(languages),
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          preferredDuration: '1-week',
          companionPreference: 'solo-buddy',
          dreamDestinations: splitTags(dreamDestinations),
          tripPlans: [
            {
              destination: tripDestination,
              startDate,
              endDate
            }
          ],
          verificationSubmission: {
            profilePhoto: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=70',
            verificationSelfie: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=70',
            note: 'Submitted from mobile prototype onboarding.'
          }
        }
      }).unwrap();

      onCompleted(user);
    } catch {
      setError('Could not save preferences. Add at least 3 interests, 1 destination, and valid dates.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        Preference onboarding
      </Text>
      <Text variant="headlineMedium" style={styles.title}>
        Tell WanderMatch what you want from the trip.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput label="Traveler bio" value={bio} onChangeText={setBio} mode="outlined" multiline />
      <Text style={styles.label}>Travel style</Text>
      <SegmentedButtons
        value={travelStyle}
        onValueChange={setTravelStyle}
        buttons={[
          { value: 'backpacker', label: 'Backpacker' },
          { value: 'budget', label: 'Budget' },
          { value: 'midrange', label: 'Mid' }
        ]}
      />
      <TextInput label="Interests" value={interests} onChangeText={setInterests} mode="outlined" />
      <TextInput label="Languages" value={languages} onChangeText={setLanguages} mode="outlined" />
      <TextInput label="Budget min per day" value={budgetMin} onChangeText={setBudgetMin} mode="outlined" keyboardType="number-pad" />
      <TextInput label="Budget max per day" value={budgetMax} onChangeText={setBudgetMax} mode="outlined" keyboardType="number-pad" />
      <TextInput label="Dream destinations" value={dreamDestinations} onChangeText={setDreamDestinations} mode="outlined" />
      <TextInput label="Upcoming trip destination" value={tripDestination} onChangeText={setTripDestination} mode="outlined" />
      <TextInput label="Start date YYYY-MM-DD" value={startDate} onChangeText={setStartDate} mode="outlined" />
      <TextInput label="End date YYYY-MM-DD" value={endDate} onChangeText={setEndDate} mode="outlined" />
      <Button mode="contained" buttonColor={colors.primary} loading={state.isLoading} onPress={submit} style={styles.button}>
        Complete preferences
      </Button>
    </ScrollView>
  );
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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
  label: {
    color: colors.text,
    fontWeight: '800'
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: '#7a2c19',
    backgroundColor: '#fff0e9',
    fontWeight: '800'
  },
  button: {
    borderRadius: 8
  }
});
