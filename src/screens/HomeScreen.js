import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import TogglePill from '../components/TogglePill';
import PosterCard from '../components/PosterCard';
import Chip from '../components/Chip';
import SectionHeader from '../components/SectionHeader';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import GlassCard from '../components/GlassCard';
import { getDiscover, getGenres, getTrendingAll } from '../api/tmdb';

const categoryOptions = {
  movie: [
    { label: 'Popular', value: 'popularity.desc' },
    { label: 'Top Rated', value: 'vote_average.desc' },
    { label: 'Newest', value: 'primary_release_date.desc' },
    { label: 'Soonest', value: 'primary_release_date.asc' }
  ],
  tv: [
    { label: 'Popular', value: 'popularity.desc' },
    { label: 'Top Rated', value: 'vote_average.desc' },
    { label: 'Newest', value: 'first_air_date.desc' },
    { label: 'Soonest', value: 'first_air_date.asc' }
  ]
};

const todayString = () => new Date().toISOString().slice(0, 10);

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [type, setType] = useState('movie');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [category, setCategory] = useState(categoryOptions.movie[0].value);
  const [genreId, setGenreId] = useState('');
  const [year, setYear] = useState('');
  const [includeUpcoming, setIncludeUpcoming] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (type === 'trending') return;
    const defaults = categoryOptions[type] || categoryOptions.movie;
    setCategory(defaults[0]?.value || 'popularity.desc');
    setGenreId('');
    setYear('');
    setIncludeUpcoming(true);
  }, [type]);

  const fetchGenres = useCallback(async () => {
    if (type === 'trending') return;
    const data = await getGenres(type);
    setGenres(data.genres || []);
  }, [type]);

  const buildDiscoverParams = useCallback(
    (pageNumber) => {
      const params = {
        page: pageNumber,
        sort_by: category,
        with_genres: genreId || undefined
      };

      if (year && year.length === 4) {
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        if (type === 'movie') {
          params['primary_release_date.gte'] = start;
          params['primary_release_date.lte'] = end;
          if (!includeUpcoming && Number(year) === new Date().getFullYear()) {
            params['primary_release_date.lte'] = todayString();
          }
        } else if (type === 'tv') {
          params['first_air_date.gte'] = start;
          params['first_air_date.lte'] = end;
          if (!includeUpcoming && Number(year) === new Date().getFullYear()) {
            params['first_air_date.lte'] = todayString();
          }
        }
      }

      return params;
    },
    [category, genreId, includeUpcoming, type, year]
  );

  const loadPage = useCallback(
    async (pageNumber, append) => {
      if (pageNumber === 1) setLoading(true);
      setError(null);
      try {
        let data;
        if (type === 'trending') {
          data = await getTrendingAll(pageNumber);
        } else {
          data = await getDiscover(type, buildDiscoverParams(pageNumber));
        }
        const normalized = (data.results || []).map((item) => ({
          ...item,
          media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie')
        }));
        setItems((prev) => (append ? [...prev, ...normalized] : normalized));
        setHasMore(pageNumber < (data.total_pages || 1));
        setPage(pageNumber);
      } catch (err) {
        setError(err?.message || 'Failed to load.');
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildDiscoverParams, type]
  );

  useEffect(() => {
    fetchGenres();
    loadPage(1, false);
  }, [fetchGenres, loadPage]);

  const filterOptions = useMemo(() => categoryOptions[type] || [], [type]);

  const renderItem = ({ item }) => (
    <PosterCard
      item={item}
      onPress={() => navigation.navigate('Details', { id: item.id, mediaType: item.media_type })}
    />
  );

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    loadPage(page + 1, true);
  };

  const heroSubtitle = loading
    ? 'Curating your feed...'
    : `Loaded ${items.length} titles`;

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <View style={[styles.ambient, styles.ambientTop, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.ambient, styles.ambientBottom, { backgroundColor: theme.colors.accent }]} />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <View style={styles.hero}>
                <Text style={[styles.title, { color: theme.colors.text }]}>CineVault</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{heroSubtitle}</Text>
                <View style={styles.heroTags}>
                  <View style={[styles.heroTag, { borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.heroTagText, { color: theme.colors.textMuted }]}>Curated picks</Text>
                  </View>
                  <View style={[styles.heroTag, { borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.heroTagText, { color: theme.colors.textMuted }]}>Glass mode</Text>
                  </View>
                </View>
              </View>

              <GlassCard style={styles.heroCard}>
                <View style={styles.heroRow}>
                  <Text style={[styles.heroLabel, { color: theme.colors.textMuted }]}>Browse</Text>
                  <Pressable onPress={() => setFiltersOpen(true)}>
                    <Text style={[styles.filterLink, { color: theme.colors.primary }]}>Filters</Text>
                  </Pressable>
                </View>
                <TogglePill
                  value={type}
                  onChange={(value) => setType(value)}
                  options={[
                    { label: 'Movies', value: 'movie' },
                    { label: 'TV', value: 'tv' },
                    { label: 'Trending', value: 'trending' }
                  ]}
                />
              </GlassCard>

              <View style={styles.filterRow}>
                <SectionHeader title="Today" />
                <Text style={[styles.miniMeta, { color: theme.colors.textMuted }]}>Scroll to explore</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <Loader />
            ) : error ? (
              <EmptyState title="Error" message={error} />
            ) : (
              <EmptyState title="No results" message="Try changing filters or switch categories." />
            )
          }
          ListFooterComponent={loadingMore ? <Loader /> : <View style={{ height: 120 }} />}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <Modal visible={filtersOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filters</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}
            >
              Apply category, genre, and year to refine results.
            </Text>

            {type !== 'trending' ? (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>Category</Text>
                <View style={styles.chipRow}>
                  {filterOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      active={category === option.value}
                      onPress={() => setCategory(option.value)}
                    />
                  ))}
                </View>

                <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>Genre</Text>
                <View style={styles.chipRow}>
                  <Chip label="All" active={genreId === ''} onPress={() => setGenreId('')} />
                  {genres.map((genre) => (
                    <Chip
                      key={genre.id}
                      label={genre.name}
                      active={genreId === String(genre.id)}
                      onPress={() => setGenreId(String(genre.id))}
                    />
                  ))}
                </View>

                <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>Year</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="2026"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />

                <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>Include upcoming</Text>
                <TogglePill
                  value={includeUpcoming ? 'yes' : 'no'}
                  onChange={(value) => setIncludeUpcoming(value === 'yes')}
                  options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' }
                  ]}
                />
              </ScrollView>
            ) : (
              <Text style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
                Trending uses TMDB global signals.
              </Text>
            )}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setFiltersOpen(false);
                  loadPage(1, false);
                }}
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={[styles.primaryLabel, { color: theme.colors.background }]}>Apply</Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.secondaryLabel, { color: theme.colors.textMuted }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    top: -60,
    right: -60
  },
  ambientBottom: {
    bottom: -60,
    left: -60
  },
  headerContainer: {
    gap: 16,
    marginBottom: 8
  },
  hero: {
    gap: 10
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 14
  },
  heroTags: {
    flexDirection: 'row',
    gap: 10
  },
  heroTag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  heroCard: {
    paddingVertical: 16
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  filterRow: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterLink: {
    fontSize: 14,
    fontWeight: '700'
  },
  miniMeta: {
    fontSize: 12
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalCard: {
    width: '88%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1
  },
  modalScroll: {
    maxHeight: 360
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  modalSubtitle: {
    fontSize: 13,
    marginVertical: 10
  },
  modalLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700'
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '700'
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '700'
  }
});

export default HomeScreen;
