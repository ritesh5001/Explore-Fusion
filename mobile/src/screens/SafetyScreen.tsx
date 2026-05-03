import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Switch, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

const safetyItems = ['ID verification badge', 'Trusted contacts', 'Emergency check-in', 'Report and block'];

export function SafetyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Safety
      </Text>
      <Card mode="contained" style={styles.heroCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Emergency check-in
          </Text>
          <Text style={styles.body}>Set a trip timer and alert trusted contacts if you do not confirm on time.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" buttonColor={colors.accent}>
            Start timer
          </Button>
        </Card.Actions>
      </Card>

      {safetyItems.map((item, index) => (
        <View key={item} style={styles.item}>
          <View>
            <Text variant="titleMedium" style={styles.itemTitle}>
              {item}
            </Text>
            <Text style={styles.muted}>{index < 2 ? 'Enabled for MVP' : 'Integration ready'}</Text>
          </View>
          <Switch value={index < 2} color={colors.primary} />
        </View>
      ))}
    </ScrollView>
  );
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
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 12
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22
  },
  item: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface
  },
  itemTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  muted: {
    color: colors.muted
  }
});
