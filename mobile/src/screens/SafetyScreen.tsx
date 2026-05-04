import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useGetProfileQuery } from '../features/api';
import { colors } from '../theme/colors';

export function SafetyScreen({ token }: { token: string }) {
  const { data: profile, isLoading, error, refetch } = useGetProfileQuery(token);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Loading safety status...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>{readApiMessage(error, 'Could not load safety status.')}</Text>
        <Button mode="contained" buttonColor={colors.primary} onPress={() => refetch()} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Safety
      </Text>

      <Card mode="contained" style={styles.heroCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Review status
          </Text>
          <Text style={styles.body}>
            Your account becomes visible in discovery only after admin approval. Photo and ID review are tracked here in real time.
          </Text>
          <View style={styles.chips}>
            <Chip compact>Account: {profile.accountStatus ?? 'pending'}</Chip>
            <Chip compact>Photo: {profile.photoVerificationStatus ?? 'not-submitted'}</Chip>
            <Chip compact>ID: {profile.verificationStatus ?? 'not-submitted'}</Chip>
          </View>
        </Card.Content>
      </Card>

      <StatusCard
        title="Discovery visibility"
        body={
          profile.accountStatus === 'approved'
            ? 'Your account is approved and can appear in traveler discovery.'
            : 'Your account is not yet approved, so discovery remains locked until review is complete.'
        }
      />
      <StatusCard
        title="Photo verification"
        body={
          profile.photoVerificationStatus === 'approved'
            ? 'Your profile photo and verification selfie have been approved.'
            : profile.photoVerificationStatus === 'pending'
              ? 'Your verification selfie is waiting for review.'
              : 'Submit onboarding with valid photo URLs to enter photo review.'
        }
      />
      <StatusCard
        title="ID verification"
        body={
          profile.verificationStatus === 'approved'
            ? 'Your ID verification is approved.'
            : profile.verificationStatus === 'pending'
              ? 'Your ID document is in review.'
              : 'ID verification stays optional until you submit an ID document during onboarding.'
        }
      />

      <Card mode="outlined" style={styles.section}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Reviewer note
          </Text>
          <Text style={styles.body}>{profile.verificationSubmission?.rejectionReason ?? 'No reviewer note is attached to your profile.'}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <Card mode="outlined" style={styles.section}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        <Text style={styles.body}>{body}</Text>
      </Card.Content>
    </Card>
  );
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
    gap: 14,
    backgroundColor: colors.background
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontWeight: '800'
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 12
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  }
});
