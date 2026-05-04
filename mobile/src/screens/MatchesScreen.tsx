import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { MatchRecord, MatchUser, useGetMatchesQuery } from '../features/api';
import { colors } from '../theme/colors';

export function MatchesScreen({
  token,
  currentUserId,
  onOpenChat,
  onOpenProfile
}: {
  token: string;
  currentUserId: string;
  onOpenChat: (matchId: string) => void;
  onOpenProfile: (userId: string) => void;
}) {
  const { data, isLoading, error, refetch } = useGetMatchesQuery(token);
  const matches = data?.matches ?? [];

  if (isLoading) {
    return <CenteredMessage label="Loading matches..." />;
  }

  if (error) {
    return <CenteredMessage label={readApiMessage(error, 'Could not load matches.')} actionLabel="Retry" onAction={() => refetch()} />;
  }

  if (!matches.length) {
    return (
      <CenteredMessage
        label="No matches yet. Like travelers in Discover; chat unlocks only after a mutual like."
        actionLabel="Refresh"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const partner = getPartner(item, currentUserId);
        return (
          <Card mode="outlined" style={styles.card}>
            <Card.Content style={styles.row}>
              <Avatar user={partner} />
              <View style={styles.grow}>
                <Text variant="titleMedium" style={styles.name}>
                  {partner?.name ?? 'Traveler'}
                </Text>
                <Text style={styles.muted}>
                  {partner?.homeCity ?? 'Unknown city'} · {item.compatibilityScore}% match
                </Text>
                <Text style={styles.date}>Matched on {new Date(item.matchedAt).toLocaleDateString()}</Text>
              </View>
            </Card.Content>
            <Card.Actions>
              {partner?._id ? (
                <Button onPress={() => onOpenProfile(partner._id)}>View profile</Button>
              ) : null}
              <Button mode="contained" buttonColor={colors.primary} onPress={() => onOpenChat(item._id)}>
                Open chat
              </Button>
            </Card.Actions>
          </Card>
        );
      }}
    />
  );
}

function getPartner(match: MatchRecord, currentUserId: string) {
  return match.users.find((user) => user._id !== currentUserId) ?? match.users[0];
}

function Avatar({ user }: { user?: MatchUser }) {
  return (
    <View style={styles.avatarWrap}>
      {user?.photos?.[0] ? (
        <Image source={{ uri: user.photos[0] }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarLabel}>{user?.name?.slice(0, 1).toUpperCase() ?? '?'}</Text>
      )}
    </View>
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
  list: {
    padding: 20,
    gap: 12,
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
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18
  },
  grow: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    color: colors.muted,
    lineHeight: 20
  },
  date: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12
  }
});
