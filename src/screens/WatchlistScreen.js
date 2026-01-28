import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import PosterCard from '../components/PosterCard';
import EmptyState from '../components/EmptyState';
import { loadWatchlist } from '../storage/watchlist';

const WatchlistScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const data = await loadWatchlist();
    setItems(data);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundAlt]} style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Watch Later</Text>
          {items.length === 0 ? (
            <EmptyState title="No saved titles" message="Save movies or shows to watch later." />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => `${item.media_type}-${item.id}`}
              renderItem={({ item }) => (
                <PosterCard
                  item={item}
                  onPress={() => navigation.navigate('Details', { id: item.id, mediaType: item.media_type })}
                />
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16
  }
});

export default WatchlistScreen;
