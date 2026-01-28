import Constants from 'expo-constants';

const BASE_URL = 'https://api.themoviedb.org/3';

const getConfig = () => {
  const envToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const envImageBase = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE;
  // Fallback to app.json "extra" for Expo Go / release builds.
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  return {
    token: envToken || extra.tmdbReadToken || '',
    imageBase: envImageBase || extra.tmdbImageBase || 'https://image.tmdb.org/t/p'
  };
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const tmdbFetch = async (path, params) => {
  const { token } = getConfig();
  if (!token) {
    throw new Error('Missing TMDB read access token. Add EXPO_PUBLIC_TMDB_READ_TOKEN to .env');
  }

  const response = await fetch(buildUrl(path, params), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=utf-8'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TMDB error ${response.status}: ${text}`);
  }

  return response.json();
};

export const getImageBase = () => getConfig().imageBase;

export const getTrendingAll = (page = 1) => tmdbFetch('/trending/all/day', { page });
export const getTrendingMovies = (page = 1) => tmdbFetch('/trending/movie/day', { page });
export const getTrendingTV = (page = 1) => tmdbFetch('/trending/tv/day', { page });

export const getDiscover = (type, params = {}) => {
  const path = type === 'tv' ? '/discover/tv' : '/discover/movie';
  return tmdbFetch(path, {
    page: params.page || 1,
    include_adult: false,
    include_video: false,
    language: 'en-US',
    ...params
  });
};

export const getList = (type, list, page = 1) => {
  const path = `/${type}/${list}`;
  return tmdbFetch(path, { page, language: 'en-US' });
};

export const searchMulti = (query, page = 1) =>
  tmdbFetch('/search/multi', { query, page, include_adult: false, language: 'en-US' });

export const searchPerson = (query, page = 1) =>
  tmdbFetch('/search/person', { query, page, include_adult: false, language: 'en-US' });

export const getDetails = (type, id) => tmdbFetch(`/${type}/${id}`, { language: 'en-US' });
export const getCredits = (type, id) => tmdbFetch(`/${type}/${id}/credits`, { language: 'en-US' });
export const getVideos = (type, id) => tmdbFetch(`/${type}/${id}/videos`, { language: 'en-US' });

export const getPerson = (id) => tmdbFetch(`/person/${id}`, { language: 'en-US' });
export const getPersonCredits = (id) =>
  tmdbFetch(`/person/${id}/combined_credits`, { language: 'en-US' });

export const getGenres = (type) => tmdbFetch(`/genre/${type}/list`, { language: 'en-US' });

export const getSeasonDetails = (tvId, seasonNumber) =>
  tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`, { language: 'en-US' });
