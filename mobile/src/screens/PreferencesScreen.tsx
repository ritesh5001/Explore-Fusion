import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { AppUser, useCompleteOnboardingMutation, useGetDestinationsQuery } from '../features/api';
import { colors } from '../theme/colors';

const STEPS = ['Account', 'Travel style', 'Interests', 'Trip dates', 'Photos'];
const TRAVEL_STYLES = ['Backpacker', 'Budget', 'Mid-range', 'Luxury'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];
const INTEREST_CATEGORIES: Array<[string, string[]]> = [
  ['Pace & vibe', ['Slow travel', 'Backpacking', 'Luxury', 'Spontaneous', 'Planned-out']],
  ['Things to do', ['Food walks', 'Hiking', 'Trekking', 'Surfing', 'Beach', 'Diving', 'Cycling', 'Yoga']],
  ['Culture', ['Heritage', 'Temples', 'Markets', 'Festivals', 'Photography', 'Music gigs']],
  ['Stay', ['Hostels', 'Homestays', 'Boutique hotels', 'Airbnb', 'Camping']]
];

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
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [travelStyle, setTravelStyle] = useState('Budget');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(['Slow travel', 'Food walks', 'Hiking', 'Photography', 'Heritage'])
  );
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set(['English', 'Hindi']));
  const [budgetMin, setBudgetMin] = useState('1500');
  const [budgetMax, setBudgetMax] = useState('5000');
  const [dreamDestinations, setDreamDestinations] = useState('Jaipur, Rishikesh, Goa');
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

  function toggleInterest(tag: string) {
    setSelectedInterests((current) => {
      const next = new Set(current);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function toggleLang(lang: string) {
    setSelectedLangs((current) => {
      const next = new Set(current);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  }

  function continueStep() {
    setError('');
    if (step === 2 && selectedInterests.size < 5) {
      setError('Pick at least 5 interests before continuing.');
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function submit() {
    setError('');

    if (!profilePhoto.trim() || !verificationSelfie.trim()) {
      setError('Add a profile photo URL and verification selfie URL before finishing.');
      setStep(4);
      return;
    }

    try {
      const user = await completeOnboarding({
        token,
        input: {
          bio: bio || 'Looking for a travel buddy who shares my interests.',
          travelStyle: travelStyle.toLowerCase().replace('-', ''),
          interests: Array.from(selectedInterests),
          languages: Array.from(selectedLangs),
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          preferredDuration,
          companionPreference,
          dreamDestinations: splitTags(dreamDestinations || tripDestination),
          tripPlans:
            tripDestination && startDate && endDate
              ? [
                  {
                    destination: tripDestination,
                    startDate,
                    endDate
                  }
                ]
              : [],
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
      setError(readApiMessage(err, 'Could not save onboarding. Fill required fields and use valid image URLs.'));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        Set up your travel profile
      </Text>
      <Text variant="headlineMedium" style={styles.title}>
        5 steps to find your travel buddy
      </Text>
      <Text style={styles.body}>Compatibility is interest-first. Verification goes to admin review after onboarding.</Text>

      <Card mode="contained" style={styles.stepperCard}>
        <Card.Content>
          <View style={styles.stepper}>
            {STEPS.map((label, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <TouchableOpacity key={label} onPress={() => setStep(index)} style={styles.stepItem}>
                  <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
                    <Text style={[styles.stepDotText, done && styles.stepDotTextDone]}>{done ? '✓' : index + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <ProgressBar progress={(step + 1) / STEPS.length} color={colors.primary} style={styles.progress} />
        </Card.Content>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.form}>
          <Text style={styles.stepTitle}>Step {step + 1} of {STEPS.length}</Text>
          {step === 0 ? <AccountStep /> : null}
          {step === 1 ? (
            <TravelStyleStep
              bio={bio}
              setBio={setBio}
              travelStyle={travelStyle}
              setTravelStyle={setTravelStyle}
              selectedLangs={selectedLangs}
              toggleLang={toggleLang}
            />
          ) : null}
          {step === 2 ? (
            <InterestsStep selectedInterests={selectedInterests} toggleInterest={toggleInterest} />
          ) : null}
          {step === 3 ? (
            <TripDatesStep
              budgetMin={budgetMin}
              budgetMax={budgetMax}
              dreamDestinations={dreamDestinations}
              endDate={endDate}
              preferredDuration={preferredDuration}
              quickDestinations={quickDestinations}
              setBudgetMax={setBudgetMax}
              setBudgetMin={setBudgetMin}
              setCompanionPreference={setCompanionPreference}
              setDreamDestinations={setDreamDestinations}
              setEndDate={setEndDate}
              setPreferredDuration={setPreferredDuration}
              setStartDate={setStartDate}
              setTripDestination={setTripDestination}
              companionPreference={companionPreference}
              startDate={startDate}
              tripDestination={tripDestination}
            />
          ) : null}
          {step === 4 ? (
            <PhotosStep
              idDocument={idDocument}
              note={note}
              profilePhoto={profilePhoto}
              setIdDocument={setIdDocument}
              setNote={setNote}
              setProfilePhoto={setProfilePhoto}
              setVerificationSelfie={setVerificationSelfie}
              verificationSelfie={verificationSelfie}
            />
          ) : null}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button mode="contained" buttonColor={colors.primary} onPress={continueStep}>
            Continue
          </Button>
        ) : (
          <Button mode="contained" buttonColor={colors.primary} loading={state.isLoading} onPress={() => void submit()}>
            Finish & start matching
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

function AccountStep() {
  return (
    <>
      <Text variant="headlineSmall" style={styles.sectionTitle}>Account created</Text>
      <Text style={styles.body}>Your login details are saved. Continue with travel style, interests, trip dates, and verification assets.</Text>
    </>
  );
}

function TravelStyleStep({
  bio,
  setBio,
  travelStyle,
  setTravelStyle,
  selectedLangs,
  toggleLang
}: {
  bio: string;
  setBio: (value: string) => void;
  travelStyle: string;
  setTravelStyle: (value: string) => void;
  selectedLangs: Set<string>;
  toggleLang: (value: string) => void;
}) {
  return (
    <>
      <Text variant="headlineSmall" style={styles.sectionTitle}>How do you like to travel?</Text>
      <View style={styles.chips}>
        {TRAVEL_STYLES.map((style) => (
          <Chip key={style} selected={travelStyle === style} onPress={() => setTravelStyle(style)} style={travelStyle === style ? styles.selectedChip : styles.chip}>
            {style}
          </Chip>
        ))}
      </View>
      <Text style={styles.label}>Languages you speak</Text>
      <View style={styles.chips}>
        {LANGUAGES.map((lang) => (
          <Chip key={lang} selected={selectedLangs.has(lang)} onPress={() => toggleLang(lang)} style={selectedLangs.has(lang) ? styles.selectedChip : styles.chip}>
            {lang}
          </Chip>
        ))}
      </View>
      <TextInput label="Short bio" value={bio} onChangeText={setBio} mode="outlined" multiline placeholder="Food walks, old city lanes, slow mornings..." />
    </>
  );
}

function InterestsStep({
  selectedInterests,
  toggleInterest
}: {
  selectedInterests: Set<string>;
  toggleInterest: (value: string) => void;
}) {
  return (
    <>
      <Text variant="headlineSmall" style={styles.sectionTitle}>What lights you up on a trip?</Text>
      <Text style={styles.body}>{selectedInterests.size} selected · pick min 5</Text>
      {INTEREST_CATEGORIES.map(([category, tags]) => (
        <View key={category}>
          <Text style={styles.label}>{category}</Text>
          <View style={styles.chips}>
            {tags.map((tag) => (
              <Chip key={tag} selected={selectedInterests.has(tag)} onPress={() => toggleInterest(tag)} style={selectedInterests.has(tag) ? styles.selectedChip : styles.chip}>
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

function TripDatesStep(props: {
  budgetMin: string;
  budgetMax: string;
  companionPreference: (typeof COMPANION_OPTIONS)[number]['value'];
  dreamDestinations: string;
  endDate: string;
  preferredDuration: (typeof DURATION_OPTIONS)[number]['value'];
  quickDestinations: string[];
  setBudgetMax: (value: string) => void;
  setBudgetMin: (value: string) => void;
  setCompanionPreference: (value: (typeof COMPANION_OPTIONS)[number]['value']) => void;
  setDreamDestinations: (value: string) => void;
  setEndDate: (value: string) => void;
  setPreferredDuration: (value: (typeof DURATION_OPTIONS)[number]['value']) => void;
  setStartDate: (value: string) => void;
  setTripDestination: (value: string) => void;
  startDate: string;
  tripDestination: string;
}) {
  return (
    <>
      <Text variant="headlineSmall" style={styles.sectionTitle}>Where and when is your next trip?</Text>
      <TextInput label="Destination" value={props.tripDestination} onChangeText={props.setTripDestination} mode="outlined" placeholder="Search Indian destination" />
      {props.quickDestinations.length ? (
        <View style={styles.chips}>
          {props.quickDestinations.map((destination) => (
            <Chip key={destination} compact onPress={() => props.setTripDestination(destination)} style={styles.chip}>
              {destination}
            </Chip>
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        <TextInput label="Start date" value={props.startDate} onChangeText={props.setStartDate} mode="outlined" placeholder="2026-07-04" style={styles.grow} />
        <TextInput label="End date" value={props.endDate} onChangeText={props.setEndDate} mode="outlined" placeholder="2026-07-16" style={styles.grow} />
      </View>
      <View style={styles.row}>
        <TextInput label="Budget min" value={props.budgetMin} onChangeText={props.setBudgetMin} mode="outlined" keyboardType="number-pad" style={styles.grow} />
        <TextInput label="Budget max" value={props.budgetMax} onChangeText={props.setBudgetMax} mode="outlined" keyboardType="number-pad" style={styles.grow} />
      </View>
      <Text style={styles.label}>Preferred duration</Text>
      <SegmentedButtons value={props.preferredDuration} onValueChange={(value) => props.setPreferredDuration(value as (typeof DURATION_OPTIONS)[number]['value'])} buttons={DURATION_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
      <Text style={styles.label}>Companion preference</Text>
      <SegmentedButtons value={props.companionPreference} onValueChange={(value) => props.setCompanionPreference(value as (typeof COMPANION_OPTIONS)[number]['value'])} buttons={COMPANION_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
      <TextInput label="Dream destinations" value={props.dreamDestinations} onChangeText={props.setDreamDestinations} mode="outlined" placeholder="Jaipur, Rishikesh, Goa" />
    </>
  );
}

function PhotosStep(props: {
  idDocument: string;
  note: string;
  profilePhoto: string;
  setIdDocument: (value: string) => void;
  setNote: (value: string) => void;
  setProfilePhoto: (value: string) => void;
  setVerificationSelfie: (value: string) => void;
  verificationSelfie: string;
}) {
  return (
    <>
      <Text variant="headlineSmall" style={styles.sectionTitle}>Submit photos for admin review</Text>
      <Text style={styles.body}>Use test image URLs for this prototype. Profile photo and selfie are required.</Text>
      <TextInput label="Profile photo URL" value={props.profilePhoto} onChangeText={props.setProfilePhoto} mode="outlined" autoCapitalize="none" placeholder="https://..." />
      <TextInput label="Verification selfie URL" value={props.verificationSelfie} onChangeText={props.setVerificationSelfie} mode="outlined" autoCapitalize="none" placeholder="https://..." />
      <TextInput label="ID document URL (optional)" value={props.idDocument} onChangeText={props.setIdDocument} mode="outlined" autoCapitalize="none" placeholder="https://..." />
      <TextInput label="Reviewer note (optional)" value={props.note} onChangeText={props.setNote} mode="outlined" multiline placeholder="Anything the admin should know." />
    </>
  );
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readApiMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'data' in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (message) {
      return message;
    }
  }

  return fallback;
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
  stepperCard: {
    backgroundColor: colors.card,
    borderRadius: 12
  },
  stepper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  stepItem: {
    width: '30%',
    minWidth: 88,
    gap: 6
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepDotActive: {
    borderColor: colors.text,
    borderWidth: 2
  },
  stepDotDone: {
    backgroundColor: colors.text,
    borderColor: colors.text
  },
  stepDotText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900'
  },
  stepDotTextDone: {
    color: '#fff'
  },
  stepLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },
  stepLabelActive: {
    color: colors.text
  },
  progress: {
    marginTop: 14,
    height: 7,
    borderRadius: 999
  },
  card: {
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  },
  form: {
    gap: 14
  },
  stepTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '900'
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectedChip: {
    backgroundColor: '#dcefe9',
    borderWidth: 1,
    borderColor: colors.primary
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: '#7a2c19',
    backgroundColor: '#fff0e9',
    fontWeight: '800'
  }
});
