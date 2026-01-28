import { getImageBase } from '../api/tmdb';

export const buildImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${getImageBase()}/${size}${path}`;
};