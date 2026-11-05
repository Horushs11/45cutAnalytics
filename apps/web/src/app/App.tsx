import { Activity, RefreshCcw } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { OverviewPage } from '../features/overview/OverviewPage';
import { PlayersPage } from '../features/players/PlayersPage';
import { TeamsPage } from '../features/teams/TeamsPage';
import { GamesPage } from '../features/games/GamesPage';
import { ComparePage } from '../features/compare/ComparePage';
import { useLeagueData } from '../hooks/useLeagueData';

export function App() {
  const { data, isPending, isError, error, refetch } = useLeagueData();
  if (isPending) return <div className="full-screen"><div className="brand__logo">45<span>°</span></div><Activity size={26} className="spin"/><h2>Cargando 45CUT Analytics</h2><p>Conectando con tu servidor local...</p></div>;
  if (isError || !data) return <div className="full-screen"><div className="error-icon">!</div><h2>No se pudo cargar la información</h2><p>{error instanceof Error ? error.message : 'Error inesperado'}</p><p>Ejecuta <code>npm run dev</code> en la raíz del proyecto.</p><button className="button button--primary" onClick={() => void refetch()}><RefreshCcw size={16}/> Reintentar</button></div>;
  return <Routes><Route element={<AppShell data={data}/> }>
    <Route index element={<OverviewPage/>} />
    <Route path="players" element={<PlayersPage/>} />
    <Route path="teams" element={<TeamsPage/>} />
    <Route path="games" element={<GamesPage/>} />
    <Route path="compare" element={<ComparePage/>} />
  </Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>;
}
