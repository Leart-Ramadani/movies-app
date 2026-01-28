import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { getPerson, getPersonCredits } from '../api/tmdb';
import { buildImageUrl } from '../utils/images';
import PosterCard from '../components/PosterCard';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';

const PersonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { id } = route.params;
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [personData, creditsData] = await Promise.all([getPerson(id), getPersonCredits(id)]);
      setPerson(personData);
      const combined = (creditsData.cast || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      setCredits(combined);
    } catch (error) {
      setPerson(null);
      setCredits([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <Loader />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!person) {
    return (
      <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={[styles.error, { color: theme.colors.text }]}>Unable to load person.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{person.name}</Text>
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.avatarWrap}>
                {person.profile_path ? (
                  <Image source={{ uri: buildImageUrl(person.profile_path, 'w342') }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: theme.colors.backgroundAlt }]} />
                )}
              </View>
              <View style={styles.heroInfo}>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                  Department: {person.known_for_department || 'Acting'}
                </Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                  Popularity: {person.popularity?.toFixed(1) || 'N/A'}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Biography</Text>
            <Text style={[styles.sectionBody, { color: theme.colors.textMuted }]}
            >
              {person.biography || 'No biography available.'}
            </Text>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Filmography</Text>
          </View>

          <FlatList
            data={credits}
            keyExtractor={(item) => `${item.media_type}-${item.id}`}
            renderItem={({ item }) => {
              const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
              return (
                <PosterCard
                  item={{ ...item, media_type: mediaType }}
                  onPress={() => navigation.navigate('Details', { id: item.id, mediaType })}
                />
              );
            }}
            scrollEnabled={false}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    padding: 20,
    paddingBottom: 120
  },
  safeArea: {
    flex: 1,
    paddingTop: 6
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  heroCard: {
    marginTop: 16
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16
  },
  avatarWrap: {
    width: 120,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  avatarFallback: {
    width: '100%',
    height: '100%'
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  meta: {
    fontSize: 13,
    marginBottom: 6
  },
  sectionCard: {
    marginTop: 20
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    padding: 20
  }
});

export default PersonScreen;
