import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'watchlist.items';

export const loadWatchlist = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveWatchlist = async (items) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const clearWatchlist = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export const toggleWatchlistItem = async (item) => {
  const items = await loadWatchlist();
  const exists = items.find((entry) => entry.id === item.id && entry.media_type === item.media_type);
  const nextItems = exists
    ? items.filter((entry) => !(entry.id === item.id && entry.media_type === item.media_type))
    : [{ ...item, addedAt: Date.now() }, ...items];
  await saveWatchlist(nextItems);
  return nextItems;
};
