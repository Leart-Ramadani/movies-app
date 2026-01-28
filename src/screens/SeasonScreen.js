import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { getSeasonDetails } from '../api/tmdb';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';

const SeasonScreen = ({ route }) => {
  const { theme } = useTheme();
  const { id, seasonNumber, title } = route.params;
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSeasonDetails(id, seasonNumber);
      setSeason(data);
    } catch (error) {
      setSeason(null);
    } finally {
      setLoading(false);
    }
  }, [id, seasonNumber]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.colors.text }]}
          >
            {title} - Season {seasonNumber}
          </Text>

          {loading ? (
            <Loader />
          ) : !season ? (
            <Text style={[styles.error, { color: theme.colors.text }]}>Unable to load season.</Text>
          ) : (
            <FlatList
              data={season.episodes || []}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <GlassCard style={styles.episodeCard}>
                  <Text style={[styles.episodeTitle, { color: theme.colors.text }]}
                  >
                    {item.episode_number}. {item.name}
                  </Text>
                  <Text style={[styles.episodeBody, { color: theme.colors.textMuted }]}
                  >
                    {item.overview || 'No overview.'}
                  </Text>
                </GlassCard>
              )}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    padding: 20
  },
  safeArea: {
    flex: 1,
    paddingTop: 6
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  episodeCard: {
    marginBottom: 16
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6
  },
  episodeBody: {
    fontSize: 13,
    lineHeight: 18
  },
  error: {
    padding: 20
  }
});

export default SeasonScreen;
