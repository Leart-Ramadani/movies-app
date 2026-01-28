import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { buildImageUrl } from '../utils/images';
import { formatYear } from '../utils/format';

const PosterCard = ({ item, onPress, footer }) => {
  const { theme } = useTheme();
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const imageUri = buildImageUrl(item.poster_path, 'w342');
  const mediaLabel = item.media_type === 'tv' ? 'TV' : 'Movie';

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} >
        <View style={styles.row}>
          <View style={styles.posterWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={[styles.posterFallback, { backgroundColor: theme.colors.backgroundAlt }]}>
                <Text style={[styles.posterText, { color: theme.colors.textMuted }]}>No Image</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {date ? date : formatYear(date)}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>{mediaLabel}</Text>
              </View>
              {item.vote_average ? (
                <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
                    {item.vote_average.toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </View>
            {footer}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  posterWrap: {
    width: 54,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden'
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  posterFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  posterText: {
    fontSize: 10
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: '700'
  },
  meta: {
    fontSize: 12,
    marginTop: 4
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap'
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600'
  }
});

export default PosterCard;
