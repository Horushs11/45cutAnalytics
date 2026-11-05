import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Database, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart,
} from 'recharts';
import { PageHeader } from '../../components/shared/PageHeader';
import { asNumber, displayValue, getTeamProfile, type AnalyticsRow } from '../../lib/analytics';

const overviewMetrics = [
  { key: 'games', label: 'Partidos' },
  { key: 'wins', label: 'Victorias' },
  { key: 'losses', label: 'Derrotas' },
  { key: 'pts_pg', label: 'PTS / PJ' },
  { key: 'opp_pts_pg', label: 'PTS recibidos / PJ' },
  { key: 'ortg', label: 'ORtg' },
  { key: 'drtg', label: 'DRtg' },
  { key: 'net_rating', label: 'Net Rating' },
] as const;

const percentages = new Set([
  'win_pct', 'two_pct', 'three_pct', 'ft_pct', 'efg_pct', 'ts_pct', 'tov_pct',
  'orb_pct', 'drb_pct', 'ftr', 'opp_two_pct', 'opp_three_pct', 'opp_ft_pct',
  'opp_efg_pct', 'opp_ts_pct', 'opp_tov_pct', 'opp_orb_pct', 'opp_drb_pct', 'opp_ftr',
]);

const friendlyNames: Record<string, string> = {
  season: 'Temporada', team: 'Equipo', team_id: 'ID de equipo',
  games: 'Partidos', wins: 'Victorias', losses: 'Derrotas', win_pct: 'Porcentaje victorias',
  pts: 'Puntos', pts_pg: 'Puntos por partido', opp_pts_pg: 'Puntos recibidos por partido',
  ortg: 'Offensive Rating', drtg: 'Defensive Rating', net_rating: 'Net Rating',
  efg_pct: 'eFG %', ts_pct: 'TS %', orb_pct: 'Rebote ofensivo %',
  drb_pct: 'Rebote defensivo %', tov_pct: 'Pérdidas %', pace: 'Ritmo',
  ftr: 'Tasa de tiros libres', point_diff_pg: 'Diferencia de puntos / PJ',
  two_pct: 'Acierto T2 %', three_pct: 'Acierto T3 %', ft_pct: 'Acierto TL %',
  orb: 'Rebotes ofensivos', drb: 'Rebotes defensivos', reb: 'Rebotes',
  ast: 'Asistencias', stl: 'Robos', tov: 'Pérdidas', blkm: 'Tapones',
};

const trendOptions = [
  { label: 'Puntos anotados / recibidos', own: 'pts', opponent: 'opp_pts' },
  { label: 'Eficiencia ORtg / DRtg', own: 'ortg', opponent: 'drtg' },
  { label: 'eFG propio / permitido', own: 'efg_pct', opponent: 'opp_efg_pct' },
  { label: 'TS propio / permitido', own: 'ts_pct', opponent: 'opp_ts_pct' },
  { label: 'Acierto T3 propio / permitido', own: 'three_pct', opponent: 'opp_three_pct' },
  { label: 'Rebotes ofensivos propios / rivales', own: 'orb', opponent: 'opp_orb' },
  { label: 'Pérdidas propias / rivales', own: 'tov', opponent: 'opp_tov' },
] as const;

const opponentComparison = [
  { label: 'eFG %', own: 'efg_pct', opponent: 'opp_efg_pct' },
  { label: 'TS %', own: 'ts_pct', opponent: 'opp_ts_pct' },
  { label: 'T3 %', own: 'three_pct', opponent: 'opp_three_pct' },
  { label: 'T2 %', own: 'two_pct', opponent: 'opp_two_pct' },
  { label: 'Rebote ofensivo %', own: 'orb_pct', opponent: 'opp_orb_pct' },
  { label: 'Pérdidas %', own: 'tov_pct', opponent: 'opp_tov_pct' },
] as const;

function numericValue(row: AnalyticsRow, field: string): number | null {
  const value = asNumber(row[field]);
  if (value === null) return null;
  return percentages.has(field) && Math.abs(value) <= 1 ? value * 100 : value;
}

function metricValue(row: AnalyticsRow, field: string): string {
  const number = numericValue(row, field);
  if (number === null) return displayValue(row[field]);
  const text = number.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  return percentages.has(field) ? text + '%' : text;
}

function metricName(key: string): string {
  const opponent = key.startsWith('opp_');
  const field = opponent ? key.slice(4) : key;
  return opponent
    ? `Rival · ${friendlyNames[field] ?? field.replaceAll('_', ' ')}`
    : friendlyNames[field] ?? field.replaceAll('_', ' ');
}

function MetricGrid({ entries }: { entries: [string, unknown][] }) {
  if (!entries.length) return <p className="profile-empty">No hay métricas registradas.</p>;
  return <div className="profile-attributes">
    {entries.map(([key, value]) => <div key={key}>
      <span title={key}>{metricName(key)}</span><strong>{metricValue({ [key]: value }, key)}</strong>
      <small className="team-metric-key">{key}</small>
    </div>)}
  </div>;
}

export function TeamProfilePage() {
  const { teamId = '' } = useParams();
  const [trend, setTrend] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, isPending, error } = useQuery({
    queryKey: ['team-profile', teamId],
    queryFn: () => getTeamProfile(teamId),
    enabled: Boolean(teamId), staleTime: 60_000,
  });

  const selectedTrend = trendOptions[trend];
  const timeline = useMemo(() => (data?.games ?? []).map((game, index) => ({
    game: `J${displayValue(game.round ?? index + 1)}`,
    opponent: String(game.opponent ?? ''),
    own: numericValue(game, selectedTrend.own),
    rival: numericValue(game, selectedTrend.opponent),
  })), [data, selectedTrend]);

  const comparisons = useMemo(() => opponentComparison.map(item => ({
    label: item.label,
    Equipo: data ? numericValue(data.team, item.own) : null,
    Rival: data ? numericValue(data.team, item.opponent) : null,
  })).filter(row => row.Equipo !== null || row.Rival !== null), [data]);

  if (isPending) return <div className="workspace-panel profile-loading">Cargando estadísticas del equipo…</div>;
  if (error || !data) return <div className="workspace-panel profile-loading">
    <p>{error instanceof Error ? error.message : 'No se encontró el perfil.'}</p>
    <Link className="text-link" to="/teams">Volver a equipos</Link>
  </div>;

  const team = data.team;
  const teamName = String(team.team ?? 'Equipo');
  const allSeason = Object.entries(team);
  const ownSeason = allSeason.filter(([key]) => !key.startsWith('opp_'));
  const opponentsSeason = allSeason.filter(([key]) => key.startsWith('opp_'));

  return <>
    <PageHeader eyebrow="TEAM INTELLIGENCE" title={teamName}
      description={`Rendimiento ofensivo, defensivo y de sus rivales · Temporada ${data.season}`}
      actions={<div className="team-profile-actions">
        <Link className="button button--secondary" to="/teams"><ArrowLeft size={16}/> Equipos</Link>
        <Link className="button button--secondary" to="/explorer?view=team_season"><Database size={16}/> Base completa</Link>
      </div>}/>

    <section className="workspace-panel profile-top">
      <div className="profile-identity">
        <span className="team-profile-mark"><Shield size={29}/></span>
        <div><strong>{teamName}</strong><p>{displayValue(team.wins)} victorias · {displayValue(team.losses)} derrotas · {displayValue(team.games)} partidos</p></div>
      </div>
      <div className="profile-stats">
        {overviewMetrics.map(({ key, label }) => <div className="profile-stat" key={key}>
          <span>{label}</span><strong>{metricValue(team, key)}</strong>
        </div>)}
      </div>
    </section>

    <div className="profile-grid section-spacing">
      <section className="workspace-panel profile-section">
        <div className="profile-heading">
          <div><h2>Evolución por jornada</h2><p>Contraste entre producción propia y del rival</p></div>
          <select aria-label="Métrica de evolución" value={trend} onChange={event => setTrend(Number(event.target.value))}>
            {trendOptions.map((option, index) => <option key={option.label} value={index}>{option.label}</option>)}
          </select>
        </div>
        <div className="profile-chart">
          {timeline.some(row => row.own !== null || row.rival !== null)
            ? <ResponsiveContainer width="100%" height="100%"><LineChart data={timeline} margin={{ top: 12, right: 16, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="#304153" strokeDasharray="3 3"/>
              <XAxis dataKey="game" stroke="#92a0b0" fontSize={11}/>
              <YAxis stroke="#92a0b0" fontSize={11}/>
              <Tooltip contentStyle={{ background: '#151f2c', border: '1px solid #304153' }}/>
              <Legend/>
              <Line dataKey="own" name="Equipo" stroke="#f2a74b" strokeWidth={2.5} type="monotone" connectNulls={false}/>
              <Line dataKey="rival" name="Rival" stroke="#6d97c5" strokeWidth={2.5} type="monotone" connectNulls={false}/>
            </LineChart></ResponsiveContainer>
            : <p className="profile-empty">No hay datos de esa métrica en los partidos.</p>}
        </div>
      </section>
      <section className="workspace-panel profile-section">
        <div className="profile-heading"><div><h2>Equipo frente a rivales</h2><p>Porcentajes de temporada calculados en PostgreSQL</p></div></div>
        <div className="profile-chart">
          {comparisons.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={comparisons} layout="vertical" margin={{ top: 5, bottom: 5, left: 14, right: 16 }}>
            <CartesianGrid stroke="#304153" strokeDasharray="3 3" horizontal={false}/>
            <XAxis type="number" stroke="#92a0b0" fontSize={11}/>
            <YAxis type="category" dataKey="label" width={112} stroke="#92a0b0" fontSize={10}/>
            <Tooltip contentStyle={{ background: '#151f2c', border: '1px solid #304153' }}/>
            <Legend/>
            <Bar dataKey="Equipo" fill="#f2a74b" radius={[0, 3, 3, 0]}/>
            <Bar dataKey="Rival" fill="#6d97c5" radius={[0, 3, 3, 0]}/>
          </BarChart></ResponsiveContainer>
            : <p className="profile-empty">No hay porcentajes comparables.</p>}
        </div>
        <p className="profile-hint">Los valores rivales proceden de las columnas opp_* de team_season. Una cifra mayor no siempre significa mejor rendimiento (p. ej. pérdidas).</p>
      </section>
    </div>

    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>Estadísticas propias · temporada</h2><p>Todas las columnas del equipo en analytics.team_season, sin omitir métricas disponibles</p></div></div>
      <MetricGrid entries={ownSeason}/>
    </section>

    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>Estadísticas permitidas a los rivales · temporada</h2><p>Puntos, tiro, rebote, pérdidas y todas las columnas opp_* existentes en PostgreSQL</p></div></div>
      <MetricGrid entries={opponentsSeason}/>
    </section>

    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>Partidos y scouting del rival</h2><p>{data.games.length} partidos. Abre cualquiera para consultar todas las estadísticas de ambos lados.</p></div></div>
      {data.games.length === 0 ? <p className="profile-empty">No hay partidos registrados para este equipo.</p> : <div className="team-games-list">
        {data.games.map((game, index) => {
          const rowId = String(game.game_id ?? index) + '-' + index;
          const open = expanded === rowId;
          return <article className="team-game" key={rowId}>
            <button type="button" className="team-game-header" onClick={() => setExpanded(open ? null : rowId)} aria-expanded={open}>
              <span className="team-game-match"><strong>J{displayValue(game.round)} · {displayValue(game.opponent)}</strong>
                <small>{displayValue(game.date)} · {displayValue(game.home_away)} · {displayValue(game.result)}</small></span>
              <span className="team-game-score">{metricValue(game, 'pts')} — {metricValue(game, 'opp_pts')}</span>
              <span className="team-game-more">{open ? 'Ocultar' : 'Ver todas'} {open ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</span>
            </button>
            {open && <div className="team-game-details">
              <h3>Estadísticas del equipo</h3>
              <MetricGrid entries={Object.entries(game).filter(([key]) => !key.startsWith('opp_'))}/>
              <h3>Estadísticas del rival</h3>
              <MetricGrid entries={Object.entries(game).filter(([key]) => key.startsWith('opp_'))}/>
            </div>}
          </article>;
        })}
      </div>}
      <div className="team-profile-bottom"><Link className="text-link" to="/explorer?view=team_game">Explorar todas las filas y columnas de team_game</Link></div>
    </section>
  </>;
}
