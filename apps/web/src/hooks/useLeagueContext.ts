import { useOutletContext } from 'react-router-dom';
import type { LeagueData } from '@45cut/shared';

export function useLeagueContext() { return useOutletContext<LeagueData>(); }
