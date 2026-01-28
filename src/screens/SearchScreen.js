import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import SearchBar from '../components/SearchBar';
import TogglePill from '../components/TogglePill';
import PosterCard from '../components/PosterCard';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { searchMulti, searchPerson } from '../api/tmdb';
import { buildImageUrl } from '../utils/images';

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('titles');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const searchPage = useCallback(
    async (pageNumber, append) => {
      if (pageNumber === 1) setLoading(true);
      setError(null);
      try {
        const data =
          mode === 'people' ? await searchPerson(query, pageNumber) : await searchMulti(query, pageNumber);
        const items = (data.results || []).filter((item) =>
          mode === 'people' ? item.media_type === 'person' || item.known_for : item.media_type !== 'person'
        );
        const normalized = items.map((item) => ({
          ...item,
          media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie')
        }));
        setResults((prev) => (append ? [...prev, ...normalized] : normalized));
        setHasMore(pageNumber < (data.total_pages || 1));
        setPage(pageNumber);
      } catch (err) {
        setError(err?.message || 'Search failed.');
        if (!append) setResults([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [mode, query]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchPage(1, false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, searchPage]);

  const handleLoadMore = () => {
    if (!query || query.length < 2 || loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    searchPage(page + 1, true);
  };

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <View style={[styles.ambient, styles.ambientTop, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.ambient, styles.ambientBottom, { backgroundColor: theme.colors.accent }]} />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Search</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                Find a title, explore an actor, or chase a mood.
              </Text>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Search movies, shows, or actors" />

              <GlassCard style={styles.modeCard}>
                <TogglePill
                  value={mode}
                  onChange={(value) => setMode(value)}
                  options={[
                    { label: 'Titles', value: 'titles' },
                    { label: 'People', value: 'people' }
                  ]}
                />
              </GlassCard>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <Loader />
            ) : error ? (
              <EmptyState title="Search error" message={error} />
            ) : (
              <EmptyState title="Start typing" message="Search for any movie, TV show, or actor." />
            )
          }
          renderItem={({ item }) =>
            mode === 'people' ? (
              <GlassCard style={styles.personCard}>
                <View style={styles.personRow}>
                  {item.profile_path ? (
                    <View style={styles.personImageWrap}>
                      <Image
                        source={{ uri: buildImageUrl(item.profile_path, 'w185') }}
                        style={styles.personImage}
                      />
                    </View>
                  ) : (
                    <View style={[styles.personImageWrap, { backgroundColor: theme.colors.backgroundAlt }]} />
                  )}
                  <View style={styles.personInfo}>
                    <Text style={[styles.personName, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={[styles.personMeta, { color: theme.colors.textMuted }]}>
                      Known for {item.known_for_department || 'Acting'}
                    </Text>
                    <Text
                      style={[styles.personLink, { color: theme.colors.primary }]}
                      onPress={() => navigation.navigate('Person', { id: item.id })}
                    >
                      View filmography
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ) : (
              <PosterCard
                item={item}
                onPress={() => navigation.navigate('Details', { id: item.id, mediaType: item.media_type })}
              />
            )
          }
          ListFooterComponent={loadingMore ? <Loader /> : <View style={{ height: 120 }} />}
          contentContainerStyle={styles.container}
        />
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
    paddingBottom: 40
  },
  safeArea: {
    flex: 1,
    paddingTop: 6
  },
  ambient: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.2
  },
  ambientTop: {
    top: -70,
    right: -60
  },
  ambientBottom: {
    bottom: -60,
    left: -60
  },
  header: {
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 14
  },
  modeCard: {
    marginTop: 4
  },
  personCard: {
    marginBottom: 16
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  personInfo: {
    flex: 1
  },
  personName: {
    fontSize: 16,
    fontWeight: '700'
  },
  personMeta: {
    fontSize: 12,
    marginTop: 4
  },
  personLink: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8
  },
  personImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden'
  },
  personImage: {
    width: '100%',
    height: '100%'
  }
});

export default SearchScreen;
