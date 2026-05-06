import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import { colors } from '../theme/colors';

const TRENDING = ['Jaipur · Jun', 'Goa · Sep', 'Meghalaya · Oct', 'Rishikesh · Aug', 'Kerala · Dec'];
const TRAVEL_STYLES = ['Backpacker', 'Budget', 'Mid-range', 'Luxury'];
const TRUST_ITEMS = [
  { icon: '🛡️', label: 'Verified IDs' },
  { icon: '❤️', label: 'Interest-first matching' },
  { icon: '👥', label: 'Group trips & cost split' },
  { icon: '✅', label: '24/7 safety check-in' },
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop';

export function HomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Budget');

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>Travel buddy matching · interest-first</Text>
          <Text style={styles.headline}>Who do you want next to you on the trip?</Text>
          <Text style={styles.subtext}>
            We match by where you're going, when, and what you actually want to do — not gender.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>WHERE</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Jaipur, Rajasthan"
          mode="outlined"
          style={styles.searchInput}
          outlineStyle={styles.inputOutline}
          dense
        />

        <Text style={[styles.searchLabel, { marginTop: 12 }]}>WHEN</Text>
        <TextInput
          value={dates}
          onChangeText={setDates}
          placeholder="Jun 4 – Jun 16"
          mode="outlined"
          style={styles.searchInput}
          outlineStyle={styles.inputOutline}
          dense
        />

        <Text style={[styles.searchLabel, { marginTop: 12 }]}>TRAVEL STYLE</Text>
        <View style={styles.styleRow}>
          {TRAVEL_STYLES.map((s) => (
            <Chip
              key={s}
              onPress={() => setSelectedStyle(s)}
              selected={s === selectedStyle}
              style={[styles.styleChip, s === selectedStyle && styles.styleChipSelected]}
              textStyle={s === selectedStyle ? styles.styleChipTextSelected : styles.styleChipText}
              compact
            >
              {s}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={onGetStarted}
          buttonColor={colors.text}
          style={styles.ctaButton}
          labelStyle={styles.ctaLabel}
        >
          Find travel buddies
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending destinations</Text>
        <View style={styles.chips}>
          {TRENDING.map((item) => (
            <Chip
              key={item}
              compact
              style={styles.trendingChip}
              textStyle={styles.trendingChipText}
              onPress={onGetStarted}
            >
              {item}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.trustSection}>
        <Text style={styles.sectionTitle}>Why Explore Fusion?</Text>
        <View style={styles.trustGrid}>
          {TRUST_ITEMS.map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Text style={styles.trustIcon}>{item.icon}</Text>
              <Text style={styles.trustLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          Skip signup until it matters. Browse trending travelers before committing.
        </Text>
        <Button mode="outlined" onPress={onGetStarted} style={styles.loginButton} textColor={colors.primary}>
          Already have an account? Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background
  },
  hero: {
    height: 320,
    justifyContent: 'flex-end'
  },
  heroImage: {
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)'
  },
  heroContent: {
    padding: 24,
    paddingBottom: 28
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  headline: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
    lineHeight: 34
  },
  subtext: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20
  },
  searchCard: {
    margin: 16,
    marginTop: -24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6
  },
  searchLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 4
  },
  searchInput: {
    backgroundColor: colors.surface,
    fontSize: 14
  },
  inputOutline: {
    borderRadius: 8
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2
  },
  styleChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  styleChipSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text
  },
  styleChipText: {
    color: colors.text,
    fontSize: 12
  },
  styleChipTextSelected: {
    color: '#fff',
    fontSize: 12
  },
  ctaButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 2
  },
  ctaLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  trendingChip: {
    backgroundColor: colors.fill,
    borderRadius: 999
  },
  trendingChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600'
  },
  trustSection: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  trustItem: {
    width: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start'
  },
  trustIcon: {
    fontSize: 22,
    marginBottom: 6
  },
  trustLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12
  },
  footerNote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18
  },
  loginButton: {
    borderColor: colors.primary,
    borderRadius: 8
  }
});
