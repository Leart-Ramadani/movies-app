import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { getCredits, getDetails, getVideos } from '../api/tmdb';
import { buildImageUrl } from '../utils/images';
import { formatRuntime, formatYear } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import { loadWatchlist, toggleWatchlistItem } from '../storage/watchlist';

const DetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { id, mediaType } = route.params;
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detailData, creditData, videoData, storedWatchlist] = await Promise.all([
        getDetails(mediaType, id),
        getCredits(mediaType, id),
        getVideos(mediaType, id),
        loadWatchlist()
      ]);
      setDetails(detailData);
      setCredits(creditData);
      setVideos(videoData?.results || []);
      setWatchlist(storedWatchlist);
    } catch (error) {
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [id, mediaType]);

  useEffect(() => {
    load();
  }, [load]);

  const isSaved = watchlist.some((item) => item.id === id && item.media_type === mediaType);
  const trailerCandidates = videos.filter(
    (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
  );
  const featuredVideos = trailerCandidates.length ? trailerCandidates : videos;

  const handleToggle = async () => {
    if (!details) return;
    const payload = {
      id: details.id,
      media_type: mediaType,
      title: details.title || details.name,
      poster_path: details.poster_path,
      release_date: details.release_date || details.first_air_date
    };
    const updated = await toggleWatchlistItem(payload);
    setWatchlist(updated);
  };

  const openVideo = (video) => {
    if (!video || !video.key) return;
    setActiveVideo(video);
    setPlayerOpen(true);
  };

  const closePlayer = () => {
    setPlayerOpen(false);
    setActiveVideo(null);
  };

  if (loading) {
    return (
      <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <Loader />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!details) {
    return (
      <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={[styles.error, { color: theme.colors.text }]}>Unable to load details.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const backdrop = buildImageUrl(details.backdrop_path, 'w780');
  const poster = buildImageUrl(details.poster_path, 'w500');
  const title = details.title || details.name;
  const subtitle = `${formatYear(details.release_date || details.first_air_date)} · ${
    mediaType === 'movie' ? formatRuntime(details.runtime) : `${details.number_of_seasons || 0} seasons`
  }`;

  const embedUrl = activeVideo
    ? `https://www.youtube-nocookie.com/embed/${activeVideo.key}?playsinline=1&modestbranding=1&rel=0`
    : null;

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: theme.colors.primary }]}>Back</Text>
          </Pressable>

          <View style={styles.hero}>
            {backdrop ? (
              <Image source={{ uri: backdrop }} style={styles.backdrop} />
            ) : (
              <View style={[styles.backdropFallback, { backgroundColor: theme.colors.backgroundAlt }]} />
            )}
            <View style={styles.heroContent}>
              <View style={styles.posterWrap}>
                {poster ? (
                  <Image source={{ uri: poster }} style={styles.poster} />
                ) : (
                  <View style={[styles.posterFallback, { backgroundColor: theme.colors.backgroundAlt }]} />
                )}
              </View>
              <View style={styles.heroText}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
                <Pressable
                  onPress={handleToggle}
                  style={[
                    styles.watchButton,
                    { backgroundColor: isSaved ? theme.colors.accent : theme.colors.primary }
                  ]}
                >
                  <Text style={[styles.watchLabel, { color: theme.colors.background }]}
                  >
                    {isSaved ? 'Saved' : 'Watch later'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
            <Text style={[styles.sectionBody, { color: theme.colors.textMuted }]}
            >
              {details.overview || 'No overview available.'}
            </Text>
            <View style={styles.genreRow}>
              {(details.genres || []).map((genre) => (
                <View key={genre.id} style={[styles.genreBadge, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.genreText, { color: theme.colors.textMuted }]}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cast</Text>
            <FlatList
              data={(credits?.cast || []).slice(0, 12)}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.castItem}
                  onPress={() => navigation.navigate('Person', { id: item.id })}
                >
                  <View style={styles.castAvatarWrap}>
                    {item.profile_path ? (
                      <Image
                        source={{ uri: buildImageUrl(item.profile_path, 'w185') }}
                        style={styles.castAvatar}
                      />
                    ) : (
                      <View style={[styles.castAvatarFallback, { backgroundColor: theme.colors.backgroundAlt }]} />
                    )}
                  </View>
                  <Text style={[styles.castName, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.castRole, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {item.character}
                  </Text>
                </Pressable>
              )}
            />
          </GlassCard>

          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trailers & Teasers</Text>
            {featuredVideos.length === 0 ? (
              <Text style={[styles.sectionBody, { color: theme.colors.textMuted }]}>No trailers available.</Text>
            ) : (
              featuredVideos.slice(0, 6).map((video) => (
                <Pressable
                  key={video.id || video.key}
                  onPress={() => openVideo(video)}
                  style={[styles.videoRow, { borderColor: theme.colors.border }]}
                >
                  <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {video.name}
                    </Text>
                    <Text style={[styles.videoMeta, { color: theme.colors.textMuted }]}
                    >
                      {video.type || 'Video'} · {video.site || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={[styles.videoLink, { color: theme.colors.primary }]}>Play</Text>
                </Pressable>
              ))
            )}
          </GlassCard>

          {mediaType === 'tv' ? (
            <GlassCard style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Seasons</Text>
              {(details.seasons || []).map((season) => (
                <Pressable
                  key={season.id}
                  style={styles.seasonRow}
                  onPress={() =>
                    navigation.navigate('Season', { id: details.id, seasonNumber: season.season_number, title })
                  }
                >
                  <Text style={[styles.seasonTitle, { color: theme.colors.text }]}>{season.name}</Text>
                  <Text style={[styles.seasonMeta, { color: theme.colors.textMuted }]}
                  >
                    {season.episode_count || 0} episodes
                  </Text>
                </Pressable>
              ))}
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={playerOpen} animationType="slide" onRequestClose={closePlayer}>
        <SafeAreaView style={[styles.playerContainer, styles.safeArea]}>
          <View style={styles.playerHeader}>
            <Pressable onPress={closePlayer}>
              <Text style={[styles.back, { color: theme.colors.primary }]}>Close</Text>
            </Pressable>
            <Text style={[styles.playerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {activeVideo?.name || 'Trailer'}
            </Text>
            <View style={{ width: 50 }} />
          </View>
          {embedUrl ? (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingTop: 6
  },
  container: {
    padding: 20,
    paddingBottom: 120
  },
  back: {
    fontSize: 14,
    fontWeight: '700'
  },
  hero: {
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden'
  },
  backdrop: {
    width: '100%',
    height: 220
  },
  backdropFallback: {
    width: '100%',
    height: 220
  },
  heroContent: {
    marginTop: -60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 16
  },
  posterWrap: {
    width: 110,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden'
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  posterFallback: {
    width: '100%',
    height: '100%'
  },
  heroText: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12
  },
  watchButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999
  },
  watchLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  sectionCard: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12
  },
  genreBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600'
  },
  castItem: {
    marginRight: 14,
    width: 100
  },
  castAvatarWrap: {
    width: 90,
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8
  },
  castAvatar: {
    width: '100%',
    height: '100%'
  },
  castAvatarFallback: {
    width: '100%',
    height: '100%'
  },
  castName: {
    fontSize: 12,
    fontWeight: '700'
  },
  castRole: {
    fontSize: 11
  },
  videoRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  videoInfo: {
    flex: 1,
    marginRight: 12
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  videoMeta: {
    fontSize: 12,
    marginTop: 4
  },
  videoLink: {
    fontSize: 13,
    fontWeight: '700'
  },
  seasonRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)'
  },
  seasonTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  seasonMeta: {
    fontSize: 12,
    marginTop: 4
  },
  error: {
    padding: 20
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  playerHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'
  },
  webview: {
    flex: 1,
    backgroundColor: '#000'
  }
});

export default DetailsScreen;