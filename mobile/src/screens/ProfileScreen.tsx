import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

const interests = ['Hiking', 'Food & Cuisine', 'Culture & History', 'Photography'];

export function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text size={78} label="RS" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.name}>
            Ritesh Sharma
          </Text>
          <Text style={styles.muted}>Mumbai · budget traveler · verified soon</Text>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Travel Preferences
        </Text>
        <View style={styles.tags}>
          {interests.map((interest) => (
            <Chip key={interest}>{interest}</Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Upcoming Trip
        </Text>
        <Text style={styles.body}>Bali, Indonesia · Jul 4-16 · looking for a small group</Text>
      </View>

      <Button mode="contained" buttonColor={colors.primary} style={styles.button}>
        Edit profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
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
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.surface
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    lineHeight: 22
  },
  button: {
    borderRadius: 8
  }
});
