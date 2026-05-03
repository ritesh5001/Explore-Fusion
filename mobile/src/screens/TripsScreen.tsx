import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { demoTrips } from '../data/demo';
import { useGetTripsQuery } from '../features/api';
import { colors } from '../theme/colors';

export function TripsScreen({ token }: { token: string }) {
  const { data } = useGetTripsQuery(token);
  const trips = data?.trips.length ? data.trips : demoTrips;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Group Trips
      </Text>
      {trips.map((trip) => (
        <Card key={trip.id ?? trip._id ?? trip.destination} mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.destination}>
              {trip.destination}
            </Text>
            <Text style={styles.muted}>{trip.dates ?? formatDateRange(trip.startDate, trip.endDate)}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>
                {trip.members ?? 1}/{trip.maxMembers} travelers
              </Text>
              <Text style={styles.meta}>{trip.status}</Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" buttonColor={colors.primary}>
              Request to join
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) {
    return 'Dates coming soon';
  }

  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
    backgroundColor: colors.background
  },
  title: {
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
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14
  },
  meta: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    backgroundColor: '#f2eee2',
    fontWeight: '800'
  }
});
