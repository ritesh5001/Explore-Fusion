import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { AppUser, useCompleteOnboardingMutation, useGetDestinationsQuery } from '../features/api';
import { colors } from '../theme/colors';

const DURATION_OPTIONS = [
  { value: 'weekend', label: 'Weekend' },
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' }
] as const;

const COMPANION_OPTIONS = [
  { value: 'solo-buddy', label: 'Buddy' },
  { value: 'small-group', label: 'Small group' },
  { value: 'large-group', label: 'Large group' }
] as const;

export function PreferencesScreen({
  token,
  onCompleted
}: {
  token: string;
  onCompleted: (user: AppUser) => void;
}) {
  const [bio, setBio] = useState('');
  const [travelStyle, setTravelStyle] = useState('budget');
  const [interests, setInterests] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');
  const [budgetMin, setBudgetMin] = useState('1500');
  const [budgetMax, setBudgetMax] = useState('5000');
  const [dreamDestinations, setDreamDestinations] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preferredDuration, setPreferredDuration] = useState<(typeof DURATION_OPTIONS)[number]['value']>('1-week');
  const [companionPreference, setCompanionPreference] = useState<(typeof COMPANION_OPTIONS)[number]['value']>('solo-buddy');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [verificationSelfie, setVerificationSelfie] = useState('');
  const [idDocument, setIdDocument] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [completeOnboarding, state] = useCompleteOnboardingMutation();
  const { data: destinationData } = useGetDestinationsQuery(tripDestination.trim() || undefined);

  const quickDestinations = useMemo(
    () => (destinationData?.destinations ?? []).slice(0, 8),
    [destinationData?.destinations]
  );

  async function submit() {
    setError('');

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
          preferredDuration,
          companionPreference,
          dreamDestinations: splitTags(dreamDestinations),
          tripPlans: [
            {
              destination: tripDestination,
              startDate,
              endDate
            }
          ],
          verificationSubmission: {
            profilePhoto,
            verificationSelfie,
            idDocument: idDocument.trim() || undefined,
            note: note.trim() || undefined
          }
        }
      }).unwrap();

      onCompleted(user);
    } catch (err) {
      const message = 'data' in (err as { data?: { message?: string } }) ? (err as { data?: { message?: string } }).data?.message : undefined;
      setError(message ?? 'Could not save onboarding. Fill every required field and use valid image URLs.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        Step 2: complete onboarding
      </Text>
      <Text variant="headlineMedium" style={styles.title}>
        Add travel preferences and verification details.
      </Text>
      <Text style={styles.body}>
        Your profile enters admin review after this step. Discovery unlocks only after account and verification approval.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        label="Traveler bio"
        value={bio}
        onChangeText={setBio}
        mode="outlined"
        multiline
        placeholder="Write at least 20 characters about how you travel, what you like, and what kind of buddy you want."
      />

      <Text style={styles.label}>Travel style</Text>
      <SegmentedButtons
        value={travelStyle}
        onValueChange={setTravelStyle}
        buttons={[
          { value: 'backpacker', label: 'Backpacker' },
          { value: 'budget', label: 'Budget' },
          { value: 'midrange', label: 'Midrange' },
          { value: 'luxury', label: 'Luxury' }
        ]}
      />

      <TextInput
        label="Interests"
        value={interests}
        onChangeText={setInterests}
        mode="outlined"
        placeholder="Hiking, Food & Cuisine, Culture & History"
      />
      <TextInput
        label="Languages"
        value={languages}
        onChangeText={setLanguages}
        mode="outlined"
        placeholder="English, Hindi"
      />

      <View style={styles.row}>
        <TextInput
          label="Budget min"
          value={budgetMin}
          onChangeText={setBudgetMin}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.grow}
        />
        <TextInput
          label="Budget max"
          value={budgetMax}
          onChangeText={setBudgetMax}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.grow}
        />
      </View>

      <Text style={styles.label}>Preferred duration</Text>
      <SegmentedButtons value={preferredDuration} onValueChange={(value) => setPreferredDuration(value as (typeof DURATION_OPTIONS)[number]['value'])} buttons={DURATION_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />

      <Text style={styles.label}>Companion preference</Text>
      <SegmentedButtons value={companionPreference} onValueChange={(value) => setCompanionPreference(value as (typeof COMPANION_OPTIONS)[number]['value'])} buttons={COMPANION_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />

      <TextInput
        label="Dream destinations"
        value={dreamDestinations}
        onChangeText={setDreamDestinations}
        mode="outlined"
        placeholder="Jaipur, Rishikesh, Goa"
      />
      <TextInput
        label="Upcoming trip destination"
        value={tripDestination}
        onChangeText={setTripDestination}
        mode="outlined"
        placeholder="Search Indian destination"
      />

      {quickDestinations.length ? (
        <View style={styles.tags}>
          {quickDestinations.map((destination) => (
            <Chip key={destination} compact onPress={() => setTripDestination(destination)}>
              {destination}
            </Chip>
          ))}
        </View>
      ) : null}

      <View style={styles.row}>
        <TextInput
          label="Start date"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          placeholder="2026-07-04"
          style={styles.grow}
        />
        <TextInput
          label="End date"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          placeholder="2026-07-16"
          style={styles.grow}
        />
      </View>

      <Text style={styles.label}>Verification images</Text>
      <TextInput
        label="Profile photo URL"
        value={profilePhoto}
        onChangeText={setProfilePhoto}
        mode="outlined"
        autoCapitalize="none"
        placeholder="https://..."
      />
      <TextInput
        label="Verification selfie URL"
        value={verificationSelfie}
        onChangeText={setVerificationSelfie}
        mode="outlined"
        autoCapitalize="none"
        placeholder="https://..."
      />
      <TextInput
        label="ID document URL (optional)"
        value={idDocument}
        onChangeText={setIdDocument}
        mode="outlined"
        autoCapitalize="none"
        placeholder="https://..."
      />
      <TextInput
        label="Admin note (optional)"
        value={note}
        onChangeText={setNote}
        mode="outlined"
        multiline
        placeholder="Anything the reviewer should know."
      />

      <Button mode="contained" buttonColor={colors.primary} loading={state.isLoading} onPress={submit} style={styles.button}>
        Finish onboarding
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
  body: {
    color: colors.muted,
    lineHeight: 22
  },
  label: {
    color: colors.text,
    fontWeight: '800'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  grow: {
    flex: 1
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
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
