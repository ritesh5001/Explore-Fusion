import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Text, TextInput } from 'react-native-paper';
import { AppUser, useGetProfileQuery, useUpdateProfileMutation } from '../features/api';
import { colors } from '../theme/colors';

export function ProfileScreen({
  token,
  onLogout,
  onUserUpdated
}: {
  token: string;
  onLogout: () => void;
  onUserUpdated: (user: AppUser) => void;
}) {
  const { data: profile, isLoading, error, refetch } = useGetProfileQuery(token);
  const [updateProfile, updateState] = useUpdateProfileMutation();
  const [bio, setBio] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [languages, setLanguages] = useState('');
  const [dreamDestinations, setDreamDestinations] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!profile) {
      return;
    }

    onUserUpdated(profile);
    setBio(profile.bio ?? '');
    setHomeCity(profile.homeCity ?? '');
    setLanguages((profile.languages ?? []).join(', '));
    setDreamDestinations((profile.dreamDestinations ?? []).join(', '));
    setBudgetMin(String(profile.budgetMin ?? 0));
    setBudgetMax(String(profile.budgetMax ?? 0));
  }, [profile, onUserUpdated]);

  async function saveProfile() {
    setFeedback('');
    try {
      const updated = await updateProfile({
        token,
        input: {
          bio,
          homeCity,
          languages: splitTags(languages),
          dreamDestinations: splitTags(dreamDestinations),
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax)
        }
      }).unwrap();
      onUserUpdated(updated);
      setFeedback('Profile updated successfully.');
    } catch (err) {
      setFeedback(readApiMessage(err, 'Could not save profile changes.'));
    }
  }

  if (isLoading) {
    return <CenteredMessage label="Loading profile..." />;
  }

  if (!profile) {
    return (
      <CenteredMessage
        label={readApiMessage(error, 'Profile could not be loaded.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {feedback ? <Text style={feedback.includes('successfully') ? styles.feedback : styles.error}>{feedback}</Text> : null}

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          {profile.photos?.[0] ? (
            <Image source={{ uri: profile.photos[0] }} style={styles.avatarImage} />
          ) : (
            <Avatar.Text size={78} label={initials} style={styles.avatar} />
          )}
          <Text variant="headlineSmall" style={styles.name}>
            {profile.name}
          </Text>
          <Text style={styles.muted}>
            {profile.email} · {profile.travelStyle ?? 'travel style pending'}
          </Text>
          <View style={styles.statusRow}>
            <StatusChip label={`Account ${profile.accountStatus ?? 'pending'}`} />
            <StatusChip label={`Photo ${profile.photoVerificationStatus ?? 'not-submitted'}`} />
            <StatusChip label={`ID ${profile.verificationStatus ?? 'not-submitted'}`} />
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.section}>
        <Card.Content style={styles.form}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Update profile
          </Text>
          <TextInput label="Bio" value={bio} onChangeText={setBio} mode="outlined" multiline />
          <TextInput label="Home city" value={homeCity} onChangeText={setHomeCity} mode="outlined" />
          <TextInput label="Languages" value={languages} onChangeText={setLanguages} mode="outlined" />
          <TextInput label="Dream destinations" value={dreamDestinations} onChangeText={setDreamDestinations} mode="outlined" />
          <View style={styles.row}>
            <TextInput label="Budget min" value={budgetMin} onChangeText={setBudgetMin} mode="outlined" keyboardType="number-pad" style={styles.grow} />
            <TextInput label="Budget max" value={budgetMax} onChangeText={setBudgetMax} mode="outlined" keyboardType="number-pad" style={styles.grow} />
          </View>
          <Button mode="contained" buttonColor={colors.primary} onPress={() => void saveProfile()} loading={updateState.isLoading}>
            Save changes
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.section}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Trip plans
          </Text>
          {profile.tripPlans?.length ? (
            profile.tripPlans.map((trip) => (
              <View key={`${trip.destination}-${trip.startDate}`} style={styles.tripItem}>
                <Text style={styles.tripTitle}>{trip.destination}</Text>
                <Text style={styles.tripMeta}>
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.body}>No trip plans saved yet.</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => refetch()}>
          Refresh
        </Button>
        <Button mode="contained" buttonColor={colors.accent} onPress={onLogout}>
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

function StatusChip({ label }: { label: string }) {
  return <Chip compact style={styles.statusChip}>{label}</Chip>;
}

function CenteredMessage({
  label,
  actionLabel,
  onAction
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.centered}>
      <Text style={styles.body}>{label}</Text>
      {actionLabel && onAction ? (
        <Button mode="contained" buttonColor={colors.primary} onPress={onAction} style={{ marginTop: 16 }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
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
    padding: 20,
    gap: 16,
    backgroundColor: colors.background
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24
  },
  avatar: {
    backgroundColor: colors.primary
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39
  },
  name: {
    marginTop: 14,
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    marginTop: 4,
    color: colors.muted,
    textAlign: 'center'
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center'
  },
  statusChip: {
    backgroundColor: '#f2eee2'
  },
  section: {
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  form: {
    gap: 12
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  grow: {
    flex: 1
  },
  tripItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12
  },
  tripTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  tripMeta: {
    marginTop: 4,
    color: colors.muted
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    lineHeight: 22
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  feedback: {
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: '#edf8ef',
    fontWeight: '700'
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: '#7a2c19',
    backgroundColor: '#fff0e9',
    fontWeight: '800'
  }
});
