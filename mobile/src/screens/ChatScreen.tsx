import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { MatchRecord, MatchUser, useGetMatchesQuery, useGetMessagesQuery, useSendMessageMutation } from '../features/api';
import { colors } from '../theme/colors';

export function ChatScreen({
  token,
  currentUserId,
  matchId,
  onOpenProfile
}: {
  token: string;
  currentUserId: string;
  matchId: string;
  onOpenProfile: (userId: string) => void;
}) {
  const [body, setBody] = useState('');
  const [feedback, setFeedback] = useState('');
  const { data: matchesData, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useGetMatchesQuery(token);
  const matches = matchesData?.matches ?? [];
  const activeMatch = useMemo(() => matches.find((item) => item._id === matchId) ?? matches[0], [matches, matchId]);
  const partner = activeMatch ? getPartner(activeMatch, currentUserId) : undefined;
  const { data: messagesData, isLoading: messagesLoading, error: messagesError, refetch: refetchMessages } = useGetMessagesQuery(
    { token, matchId: activeMatch?._id ?? '' },
    { skip: !activeMatch?._id }
  );
  const [sendMessage, sendState] = useSendMessageMutation();

  useEffect(() => {
    setFeedback('');
  }, [matchId]);

  async function submitMessage() {
    if (!activeMatch || !body.trim()) {
      return;
    }

    try {
      await sendMessage({ token, matchId: activeMatch._id, body: body.trim() }).unwrap();
      setBody('');
      refetchMessages();
    } catch (err) {
      setFeedback(readApiMessage(err, 'Could not send message.'));
    }
  }

  if (matchesLoading) {
    return <CenteredMessage label="Loading conversations..." />;
  }

  if (matchesError || !activeMatch || !partner) {
    return (
      <CenteredMessage
        label={readApiMessage(matchesError, 'No matched conversation found.')}
        actionLabel="Retry"
        onAction={() => refetchMatches()}
      />
    );
  }

  const messages = messagesData?.messages ?? [];

  return (
    <View style={styles.container}>
      <Card mode="contained" style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar user={partner} />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.name}>
              {partner.name}
            </Text>
            <Text style={styles.muted}>
              {partner.homeCity ?? 'Unknown city'} · {activeMatch.compatibilityScore}% match
            </Text>
          </View>
          <Button onPress={() => onOpenProfile(partner._id)}>View profile</Button>
        </Card.Content>
      </Card>

      {feedback ? <Text style={styles.error}>{feedback}</Text> : null}
      {messagesError ? <Text style={styles.error}>{readApiMessage(messagesError, 'Could not load messages.')}</Text> : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messages}
        ListEmptyComponent={
          messagesLoading ? <Text style={styles.muted}>Loading messages...</Text> : <Text style={styles.muted}>No messages yet. Start the conversation.</Text>
        }
        renderItem={({ item }) => {
          const mine = String(item.sender) === currentUserId;
          return (
            <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.bubbleText, mine ? styles.myBubbleText : styles.theirBubbleText]}>{item.body}</Text>
              <Text style={[styles.bubbleMeta, mine ? styles.myMeta : styles.theirMeta]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.composer}>
        <TextInput
          mode="outlined"
          value={body}
          onChangeText={setBody}
          placeholder={`Message ${partner.name.split(' ')[0]}`}
          style={styles.composerInput}
        />
        <Button mode="contained" buttonColor={colors.primary} onPress={() => void submitMessage()} loading={sendState.isLoading}>
          Send
        </Button>
      </View>
    </View>
  );
}

function getPartner(match: MatchRecord, currentUserId: string) {
  return match.users.find((user) => user._id !== currentUserId) ?? match.users[0];
}

function Avatar({ user }: { user: MatchUser }) {
  return (
    <View style={styles.avatarWrap}>
      {user.photos?.[0] ? (
        <Image source={{ uri: user.photos[0] }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarLabel}>{user.name.slice(0, 1).toUpperCase()}</Text>
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
  container: {
    flex: 1,
    padding: 16,
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
  headerCard: {
    borderRadius: 14,
    backgroundColor: colors.card
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 16
  },
  name: {
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    color: colors.muted
  },
  messages: {
    flexGrow: 1,
    gap: 10,
    paddingVertical: 8
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  bubbleText: {
    lineHeight: 20
  },
  myBubbleText: {
    color: '#fff'
  },
  theirBubbleText: {
    color: colors.text
  },
  bubbleMeta: {
    marginTop: 6,
    fontSize: 11
  },
  myMeta: {
    color: 'rgba(255,255,255,0.82)'
  },
  theirMeta: {
    color: colors.muted
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  composerInput: {
    flex: 1
  },
  error: {
    borderRadius: 8,
    padding: 12,
    color: '#7a2c19',
    backgroundColor: '#fff0e9',
    fontWeight: '800'
  }
});
