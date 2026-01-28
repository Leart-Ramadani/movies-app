export const formatYear = (dateString) => {
  if (!dateString) return 'Unknown';
  return String(dateString).slice(0, 4);
};

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
};