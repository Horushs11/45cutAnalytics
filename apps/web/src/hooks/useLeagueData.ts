import { useQuery } from '@tanstack/react-query';
import { fetchLeagueData } from '../lib/api';

export const useLeagueData = () => useQuery({
  queryKey: ['league'],
  queryFn: fetchLeagueData,
  staleTime: 60_000,
  refetchOnWindowFocus: false,
});
