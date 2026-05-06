import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { MatchRecord, MatchUser, useGetMatchesQuery } from '../features/api';
import { colors } from '../theme/colors';

export function MatchesScreen({
  token,
  currentUserId,
  onOpenChat,
  onOpenProfile,
  onPlanTrip
}: {
  token: string;
  currentUserId: string;
  onOpenChat: (matchId: string) => void;
  onOpenProfile: (userId: string) => void;
  onPlanTrip: () => void;
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
        secondaryActionLabel="Plan a trip"
        onSecondaryAction={onPlanTrip}
      />
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.grow}>
            <Text variant="headlineMedium" style={styles.title}>Your matches</Text>
            <Text style={styles.muted}>{matches.length} active conversations</Text>
          </View>
          <Button mode="contained" buttonColor={colors.primary} onPress={onPlanTrip}>
            Plan a trip
          </Button>
        </View>
      }
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
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <View style={styles.centered}>
      <Text style={styles.muted}>{label}</Text>
      <View style={styles.centeredActions}>
        {actionLabel && onAction ? (
          <Button mode="contained" buttonColor={colors.primary} onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <Button mode="outlined" onPress={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        ) : null}
      </View>
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
  centeredActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4
  },
  title: {
    color: colors.text,
    fontWeight: '800'
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
