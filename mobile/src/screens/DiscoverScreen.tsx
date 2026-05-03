import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, Text } from 'react-native-paper';
import { demoProfiles } from '../data/demo';
import { useGetDiscoverProfilesQuery } from '../features/api';
import { colors } from '../theme/colors';

export function DiscoverScreen({ token }: { token: string }) {
  const [index, setIndex] = useState(0);
  const { data, isError } = useGetDiscoverProfilesQuery(token);
  const profiles = data?.profiles.length ? data.profiles : demoProfiles;
  const profile = profiles[index % profiles.length];
  const status = isError ? 'Demo data' : data ? 'API connected' : 'Loading matches';

  const initials = useMemo(
    () =>
      profile.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2),
    [profile.name]
  );

  function next() {
    setIndex((current) => current + 1);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="labelLarge" style={styles.eyebrow}>
            {status}
          </Text>
          <Text variant="headlineMedium" style={styles.title}>
            Discover
          </Text>
        </View>
        <Chip compact>{profile.compatibilityScore}%</Chip>
      </View>

      <Card style={styles.card} mode="contained">
        <View style={styles.photo}>
          <Text variant="displayMedium" style={styles.initials}>
            {initials}
          </Text>
        </View>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.name}>
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </Text>
          <Text style={styles.muted}>{profile.homeCity}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.tags}>
            {profile.interests.map((interest) => (
              <Chip key={interest} compact>
                {interest}
              </Chip>
            ))}
          </View>
          <View style={styles.metrics}>
            <View>
              <Text variant="titleMedium" style={styles.metricValue}>
                {profile.trustScore.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>trust</Text>
            </View>
            <View>
              <Text variant="titleMedium" style={styles.metricValue}>
                INR {profile.budgetMin}-{profile.budgetMax}
              </Text>
              <Text style={styles.metricLabel}>daily budget</Text>
            </View>
          </View>
          <ProgressBar progress={profile.compatibilityScore / 100} color={colors.primary} style={styles.progress} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={next} style={styles.actionButton}>
          Skip
        </Button>
        <Button mode="contained" onPress={next} buttonColor={colors.accent} style={styles.actionButton}>
          Like
        </Button>
        <Button mode="outlined" onPress={next} style={styles.actionButton}>
          Super
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 18,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 18
  },
  photo: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.primary
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
  metricValue: {
    color: colors.text,
    fontWeight: '800'
  },
  metricLabel: {
    color: colors.muted
  },
  progress: {
    marginTop: 18,
    height: 8,
    borderRadius: 999
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flex: 1,
    borderRadius: 8
  }
});
