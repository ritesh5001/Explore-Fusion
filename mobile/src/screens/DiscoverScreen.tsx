import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, Text } from 'react-native-paper';
import { DiscoverProfile, useGetDiscoverProfilesQuery, useSwipeUserMutation } from '../features/api';
import { colors } from '../theme/colors';

export function DiscoverScreen({
  token,
  onOpenProfile,
  onOpenMatches
}: {
  token: string;
  onOpenProfile: (userId: string) => void;
  onOpenMatches: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { data, isLoading, error, refetch } = useGetDiscoverProfilesQuery(token);
  const [swipeUser, swipeState] = useSwipeUserMutation();
  const profiles = data?.profiles ?? [];
  const profile = profiles[index];

  const initials = useMemo(() => {
    if (!profile) {
      return '';
    }

    return profile.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile]);

  async function submitSwipe(action: 'left' | 'right' | 'super') {
    if (!profile) {
      return;
    }

    setFeedback('');

    try {
      const response = await swipeUser({
        token,
        targetUserId: String(profile.id ?? profile._id ?? ''),
        action,
        compatibilityScore: profile.compatibilityScore
      }).unwrap();

      if (response.match) {
        setFeedback(`Matched with ${profile.name}. Chat is now available.`);
      } else {
        setFeedback(action === 'left' ? `Passed on ${profile.name}.` : `Sent interest to ${profile.name}.`);
      }

      setIndex((current) => current + 1);
    } catch (err) {
      setFeedback(readApiMessage(err, 'Could not submit swipe right now.'));
    }
  }

  if (isLoading) {
    return <ScreenNotice title="Loading discover queue..." />;
  }

  if (error) {
    return (
      <ScreenNotice
        title={readApiMessage(error, 'Could not load discovery.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  if (!profile) {
    return (
      <ScreenNotice
        title="No new approved travelers are available right now."
        body="Check again later or create a trip while the next profiles come in."
        actionLabel="Refresh"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="labelLarge" style={styles.eyebrow}>
            Approved travelers
          </Text>
          <Text variant="headlineMedium" style={styles.title}>
            Discover
          </Text>
        </View>
        <Chip compact>{profile.compatibilityScore}% match</Chip>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <Card style={styles.card} mode="contained">
        <View style={styles.photo}>
          {profile.photos?.[0] ? (
            <Image source={{ uri: profile.photos[0] }} style={styles.photoImage} />
          ) : (
            <Text variant="displayMedium" style={styles.initials}>
              {initials}
            </Text>
          )}
        </View>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.name}>
            {profile.name}
          </Text>
          <Text style={styles.muted}>{profile.homeCity ?? 'Unknown city'}</Text>
          <Text style={styles.bio}>{profile.bio ?? 'No bio provided yet.'}</Text>

          <View style={styles.tags}>
            {profile.interests.map((interest) => (
              <Chip key={interest} compact>
                {interest}
              </Chip>
            ))}
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricCard}>
              <Text variant="titleMedium" style={styles.metricValue}>
                {profile.trustScore.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>Trust score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text variant="titleMedium" style={styles.metricValue}>
                INR {profile.budgetMin}-{profile.budgetMax}
              </Text>
              <Text style={styles.metricLabel}>Daily budget</Text>
            </View>
          </View>

          <ProgressBar progress={profile.compatibilityScore / 100} color={colors.primary} style={styles.progress} />

          <Button
            mode="outlined"
            style={styles.profileButton}
            onPress={() => onOpenProfile(String(profile.id ?? profile._id ?? ''))}
          >
            View full profile
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => void submitSwipe('left')} style={styles.actionButton} disabled={swipeState.isLoading}>
          Pass
        </Button>
        <Button mode="contained" onPress={() => void submitSwipe('right')} buttonColor={colors.accent} style={styles.actionButton} loading={swipeState.isLoading}>
          Like
        </Button>
        <Button mode="outlined" onPress={() => void submitSwipe('super')} style={styles.actionButton} disabled={swipeState.isLoading}>
          Super
        </Button>
      </View>

      <Button mode="text" onPress={onOpenMatches}>
        Open matches
      </Button>
    </ScrollView>
  );
}

function ScreenNotice({
  title,
  body,
  actionLabel,
  onAction
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.noticeWrap}>
      <Card mode="contained" style={styles.noticeCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.noticeTitle}>
            {title}
          </Text>
          {body ? <Text style={styles.noticeBody}>{body}</Text> : null}
          {actionLabel && onAction ? (
            <Button mode="contained" onPress={onAction} buttonColor={colors.primary} style={styles.noticeButton}>
              {actionLabel}
            </Button>
          ) : null}
        </Card.Content>
      </Card>
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
    gap: 18,
    backgroundColor: colors.background
  },
  noticeWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800'
  },
  title: {
    color: colors.text,
    fontWeight: '800'
  },
  feedback: {
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: '#edf8ef',
    fontWeight: '700'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18
  },
  photo: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.primary
  },
  photoImage: {
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
    marginTop: 4,
    color: colors.muted,
    fontWeight: '700'
  },
  bio: {
    marginTop: 14,
    color: colors.text,
    lineHeight: 22
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.surface
  },
  metricValue: {
    color: colors.text,
    fontWeight: '800'
  },
  metricLabel: {
    marginTop: 4,
    color: colors.muted
  },
  progress: {
    marginTop: 18,
    height: 8,
    borderRadius: 999
  },
  profileButton: {
    marginTop: 16,
    borderRadius: 8
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flex: 1,
    borderRadius: 8
  },
  noticeCard: {
    backgroundColor: colors.card,
    borderRadius: 16
  },
  noticeTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  noticeBody: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22
  },
  noticeButton: {
    marginTop: 16,
    borderRadius: 8
  }
});
