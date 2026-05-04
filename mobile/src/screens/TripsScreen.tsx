import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useCreateTripMutation, useGetDestinationsQuery, useGetTripsQuery, useJoinTripMutation } from '../features/api';
import { colors } from '../theme/colors';

export function TripsScreen({ token }: { token: string }) {
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState<'solo_buddy' | 'group'>('group');
  const [maxMembers, setMaxMembers] = useState('4');
  const [feedback, setFeedback] = useState('');
  const { data, isLoading, error, refetch } = useGetTripsQuery(token);
  const { data: destinationData } = useGetDestinationsQuery(destination.trim() || undefined);
  const [createTrip, createState] = useCreateTripMutation();
  const [joinTrip, joinState] = useJoinTripMutation();
  const trips = data?.trips ?? [];

  async function submitTrip() {
    setFeedback('');
    try {
      await createTrip({
        token,
        destination,
        startDate,
        endDate,
        tripType,
        maxMembers: Number(maxMembers)
      }).unwrap();
      setShowForm(false);
      setDestination('');
      setStartDate('');
      setEndDate('');
      setMaxMembers('4');
      setFeedback('Trip created successfully.');
      refetch();
    } catch (err) {
      setFeedback(readApiMessage(err, 'Could not create trip.'));
    }
  }

  async function requestJoin(tripId?: string) {
    if (!tripId) {
      return;
    }

    setFeedback('');
    try {
      await joinTrip({ token, tripId }).unwrap();
      setFeedback('Trip updated successfully.');
      refetch();
    } catch (err) {
      setFeedback(readApiMessage(err, 'Could not join trip.'));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Group trips
          </Text>
          <Text style={styles.body}>Create real trips from MongoDB data or join existing travel plans.</Text>
        </View>
        <Button mode="contained" buttonColor={colors.primary} onPress={() => setShowForm((current) => !current)}>
          {showForm ? 'Close form' : 'Create trip'}
        </Button>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{readApiMessage(error, 'Could not load trips.')}</Text> : null}

      {showForm ? (
        <Card mode="contained" style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <TextInput label="Destination" value={destination} onChangeText={setDestination} mode="outlined" />
            {destinationData?.destinations?.length ? (
              <View style={styles.destinationList}>
                {destinationData.destinations.slice(0, 6).map((item) => (
                  <Button key={item} mode="text" compact onPress={() => setDestination(item)}>
                    {item}
                  </Button>
                ))}
              </View>
            ) : null}
            <View style={styles.row}>
              <TextInput label="Start date" value={startDate} onChangeText={setStartDate} mode="outlined" placeholder="2026-07-04" style={styles.grow} />
              <TextInput label="End date" value={endDate} onChangeText={setEndDate} mode="outlined" placeholder="2026-07-16" style={styles.grow} />
            </View>
            <SegmentedButtons
              value={tripType}
              onValueChange={(value) => setTripType(value as 'solo_buddy' | 'group')}
              buttons={[
                { value: 'solo_buddy', label: 'Buddy' },
                { value: 'group', label: 'Group' }
              ]}
            />
            <TextInput label="Max members" value={maxMembers} onChangeText={setMaxMembers} mode="outlined" keyboardType="number-pad" />
            <Button mode="contained" buttonColor={colors.accent} onPress={() => void submitTrip()} loading={createState.isLoading}>
              Save trip
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {isLoading ? <Text style={styles.body}>Loading trips...</Text> : null}
      {!isLoading && !trips.length ? (
        <Card mode="contained" style={styles.emptyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No trips created yet.
            </Text>
            <Text style={styles.body}>Create the first trip to start the shared itinerary workflow on mobile.</Text>
          </Card.Content>
        </Card>
      ) : null}

      {trips.map((trip) => {
        const tripId = trip._id ?? trip.id;
        const memberCount = Array.isArray(trip.members) ? trip.members.length : trip.members ?? 0;

        return (
          <Card key={tripId ?? trip.destination} mode="outlined" style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.destination}>
                {trip.destination}
              </Text>
              <Text style={styles.muted}>{formatDateRange(trip.startDate, trip.endDate) || trip.dates || 'Dates pending'}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaChip}>
                  {trip.tripType === 'solo_buddy' ? 'Buddy trip' : 'Group trip'}
                </Text>
                <Text style={styles.metaChip}>
                  {memberCount}/{trip.maxMembers} travelers
                </Text>
                <Text style={styles.metaChip}>{trip.status}</Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" buttonColor={colors.primary} onPress={() => void requestJoin(tripId)} loading={joinState.isLoading}>
                Join trip
              </Button>
            </Card.Actions>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) {
    return '';
  }

  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
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
  header: {
    gap: 14
  },
  title: {
    color: colors.text,
    fontWeight: '800'
  },
  body: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 22
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
  },
  formCard: {
    borderRadius: 14,
    backgroundColor: colors.card
  },
  formContent: {
    gap: 12
  },
  destinationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  grow: {
    flex: 1
  },
  emptyCard: {
    borderRadius: 14,
    backgroundColor: colors.card
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12
  },
  destination: {
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    marginTop: 6,
    color: colors.muted,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },
  metaChip: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    backgroundColor: '#f2eee2',
    fontWeight: '800'
  }
});
