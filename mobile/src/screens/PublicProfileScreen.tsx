import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, Text } from 'react-native-paper';
import { useGetPublicProfileQuery, useSwipeUserMutation } from '../features/api';
import { colors } from '../theme/colors';

export function PublicProfileScreen({
  token,
  userId,
  onAfterLike
}: {
  token: string;
  userId: string;
  onAfterLike: () => void;
}) {
  const { data: profile, isLoading, error, refetch } = useGetPublicProfileQuery({ token, userId });
  const [swipeUser, swipeState] = useSwipeUserMutation();
  if (isLoading) {
    return <CenteredMessage label="Loading traveler profile..." />;
  }

  if (!profile) {
    return (
      <CenteredMessage
        label={readApiMessage(error, 'Could not load traveler profile.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const loadedProfile = profile;

  async function likeProfile() {
    try {
      await swipeUser({
        token,
        targetUserId: loadedProfile._id,
        action: 'right',
        compatibilityScore: 0
      }).unwrap();
      onAfterLike();
    } catch {}
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="contained" style={styles.card}>
        <View style={styles.photoWrap}>
          {loadedProfile.photos?.[0] ? (
            <Image source={{ uri: loadedProfile.photos[0] }} style={styles.photo} />
          ) : (
            <Text variant="displayMedium" style={styles.initials}>
              {loadedProfile.name.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.name}>
            {loadedProfile.name}
          </Text>
          <Text style={styles.muted}>
            {loadedProfile.homeCity ?? 'Unknown city'} · {loadedProfile.travelStyle ?? 'style not set'}
          </Text>
          <Text style={styles.bio}>{loadedProfile.bio ?? 'No bio provided.'}</Text>

          <View style={styles.chips}>
            {(loadedProfile.interests ?? []).map((interest) => (
              <Chip key={interest} compact>
                {interest}
              </Chip>
            ))}
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>Languages</Text>
            <Text style={styles.metaBody}>{(loadedProfile.languages ?? []).join(', ') || 'Not added'}</Text>
            <Text style={styles.metaTitle}>Dream destinations</Text>
            <Text style={styles.metaBody}>{(loadedProfile.dreamDestinations ?? []).join(', ') || 'Not added'}</Text>
            <Text style={styles.metaTitle}>Budget</Text>
            <Text style={styles.metaBody}>INR {loadedProfile.budgetMin ?? 0}-{loadedProfile.budgetMax ?? 0}</Text>
          </View>

          <ProgressBar progress={(loadedProfile.trustScore ?? 4.5) / 5} color={colors.primary} style={styles.progress} />

          <Button mode="contained" buttonColor={colors.accent} onPress={() => void likeProfile()} loading={swipeState.isLoading} style={styles.button}>
            Like traveler
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
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
      <Text style={styles.muted}>{label}</Text>
      {actionLabel && onAction ? (
        <Button mode="contained" buttonColor={colors.primary} onPress={onAction} style={{ marginTop: 16 }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
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
    borderRadius: 16
  },
  photoWrap: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.primary
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  initials: {
    color: '#fff',
    fontWeight: '900'
  },
  name: {
    marginTop: 18,
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    marginTop: 6,
    color: colors.muted
  },
  bio: {
    marginTop: 14,
    color: colors.text,
    lineHeight: 22
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  metaCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface
  },
  metaTitle: {
    color: colors.text,
    fontWeight: '800',
    marginTop: 10
  },
  metaBody: {
    color: colors.muted,
    marginTop: 4
  },
  progress: {
    marginTop: 18,
    height: 8,
    borderRadius: 999
  },
  button: {
    marginTop: 18,
    borderRadius: 8
  }
});
