import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Avatar } from '../../components/shared/Avatar';
import { PageHeader } from '../../components/shared/PageHeader';
import { asNumber, displayValue, getPlayerProfile } from '../../lib/analytics';

const summary = [
  ['pts_pg', 'PTS / PJ'], ['reb_pg', 'REB / PJ'], ['ast_pg', 'AST / PJ'],
  ['minutes_pg', 'MIN / PJ'], ['ts_pct', 'TS %'], ['efg_pct', 'eFG %'],
  ['usg_pct', 'USG %'], ['valuation_pg', 'VAL / PJ'],
] as const;
const trendOptions = [
  ['pts', 'Puntos'], ['reb', 'Rebotes'], ['ast', 'Asistencias'], ['minutes', 'Minutos'],
  ['ts_pct', 'True Shooting'], ['efg_pct', 'eFG'], ['usg_pct', 'Uso'],
  ['valuation', 'Valoración'], ['orb', 'Rebote ofensivo'], ['tov', 'Pérdidas'],
] as const;
const percentileMetrics = [
  ['pct_pts_40', 'Anotación / 40'], ['pct_ts', 'Eficiencia TS'], ['pct_ast', 'Creación'],
  ['pct_tov_control', 'Control pérdidas'], ['pct_reb', 'Rebote'], ['pct_stl', 'Robos'],
] as const;

function formatStat(value: unknown, isPercent = false): string {
  const number = asNumber(value);
  if (number === null) return '—';
  const adjusted = isPercent && Math.abs(number) <= 1 ? number * 100 : number;
  return adjusted.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + (isPercent ? '%' : '');
}

export function PlayerProfilePage() {
  const { playerId = '' } = useParams();
  const [trendMetric, setTrendMetric] = useState('pts');
  const { data, isLoading, error } = useQuery({
    queryKey: ['player-profile', playerId], queryFn: () => getPlayerProfile(playerId),
    enabled: !!playerId, staleTime: 60_000,
  });
  const trends = useMemo(() => (data?.games ?? []).map((game, index) => ({
    game: `J${displayValue(game.round ?? index + 1)}`,
    opponent: String(game.opponent ?? ''),
    value: asNumber(game[trendMetric]),
  })), [data, trendMetric]);
  const radar = useMemo(() => percentileMetrics.map(([field, label]) => ({
    label, value: asNumber(data?.percentiles?.[field]),
  })).filter(item => item.value !== null), [data]);
  const scoreTrend = useMemo(() => (data?.scores ?? []).map((row, index) => ({
    game: `J${displayValue(row.round ?? index + 1)}`,
    value: asNumber(row.cut_score),
  })), [data]);

  if (isLoading) return <div className="workspace-panel profile-loading">Cargando perfil del jugador…</div>;
  if (error || !data) return <div className="workspace-panel profile-loading"><p>{error instanceof Error ? error.message : 'Perfil no disponible.'}</p><Link className="text-link" to="/players">Volver a jugadores</Link></div>;

  const player = data.player;
  const name = String(player.player_name ?? 'Jugador');
  const radarValid = radar.length >= 3;
  const allSeasonStats = Object.entries(player);

  return <>
    <PageHeader eyebrow="PLAYER INTELLIGENCE" title={name} description={`${displayValue(player.team)} · ${displayValue(player.position)} · Temporada ${data.season}`}
      actions={<Link to="/players" className="button button--secondary"><ArrowLeft size={16}/> Jugadores</Link>}/>
    <div className="workspace-panel profile-top">
      <div className="profile-identity"><Avatar name={name}/><div><strong>{name}</strong><p>{displayValue(player.team)} · {displayValue(player.age)} años · {displayValue(player.height_m)} m · {displayValue(player.games)} partidos</p></div></div>
      <div className="profile-stats">
        {summary.map(([field, label]) => <div className="profile-stat" key={field}><span>{label}</span><strong>{formatStat(player[field], field.endsWith('_pct'))}</strong></div>)}
      </div>
    </div>
    <div className="profile-grid section-spacing">
      <section className="workspace-panel profile-section">
        <div className="profile-heading"><div><h2>Evolución por jornada</h2><p>Estadísticas de cada partido</p></div>
          <select aria-label="Estadística del gráfico" value={trendMetric} onChange={event => setTrendMetric(event.target.value)}>{trendOptions.map(([field, label]) => <option key={field} value={field}>{label}</option>)}</select>
        </div>
        <div className="profile-chart">
          {trends.some(item => item.value !== null) ? <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 16, right: 22, bottom: 8, left: -22 }}>
              <CartesianGrid stroke="#304153" strokeDasharray="3 3"/><XAxis dataKey="game" stroke="#92a0b0" fontSize={11}/>
              <YAxis stroke="#92a0b0" fontSize={11}/><Tooltip contentStyle={{ background: '#151f2c', border: '1px solid #304153' }}/>
              <Line dataKey="value" name={trendOptions.find(item => item[0] === trendMetric)?.[1] ?? trendMetric} type="monotone" stroke="#f2a74b" strokeWidth={2.5} connectNulls={false}/>
            </LineChart>
          </ResponsiveContainer> : <p className="profile-empty">Sin datos de esta estadística.</p>}
        </div>
      </section>
      <section className="workspace-panel profile-section">
        <div className="profile-heading"><div><h2>Radar de percentiles</h2><p>Percentiles calculados en tu base de datos</p></div><BarChart3 size={19}/></div>
        <div className="profile-chart">
          {radarValid ? <ResponsiveContainer width="100%" height="100%"><RadarChart data={radar} outerRadius="64%">
            <PolarGrid stroke="#304153"/><PolarAngleAxis dataKey="label" stroke="#92a0b0" fontSize={10}/>
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false}/>
            <Radar dataKey="value" name="Percentil" stroke="#f2a74b" fill="#f2a74b" fillOpacity={0.22}/>
            <Tooltip contentStyle={{ background: '#151f2c', border: '1px solid #304153' }}/>
          </RadarChart></ResponsiveContainer> : <p className="profile-empty">No hay suficientes percentiles para mostrar el radar.</p>}
        </div>
        <p className="profile-hint">Se muestran los percentiles guardados en analytics.player_percentiles. La interpretación depende del grupo de comparación utilizado en la vista SQL.</p>
      </section>
    </div>
    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>45CUT Score</h2><p>Evolución de la puntuación propia y arquetipo por partido</p></div></div>
      <div className="profile-chart profile-chart--short">
        {scoreTrend.some(item => item.value !== null) ? <ResponsiveContainer width="100%" height="100%"><LineChart data={scoreTrend} margin={{ top: 8, right: 20, left: -20, bottom: 2 }}>
          <CartesianGrid stroke="#304153" strokeDasharray="3 3"/><XAxis dataKey="game" stroke="#92a0b0" fontSize={11}/><YAxis stroke="#92a0b0" fontSize={11}/>
          <Tooltip contentStyle={{ background: '#151f2c', border: '1px solid #304153' }}/><Line dataKey="value" stroke="#6d97c5" strokeWidth={2.5} type="monotone"/>
        </LineChart></ResponsiveContainer> : <p className="profile-empty">Todavía no hay puntuaciones 45CUT disponibles.</p>}
      </div>
      {data.scores.length > 0 && <div className="profile-score-footer">{data.scores.map((row, index) => <span key={index}>J{displayValue(row.round)}: {displayValue(row.game_archetype)} · {formatStat(row.cut_score)}</span>)}</div>}
    </section>
    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>Estadísticas completas de temporada</h2><p>Todas las columnas disponibles en analytics.player_season</p></div></div>
      <div className="profile-attributes">{allSeasonStats.map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{displayValue(value)}</strong></div>)}</div>
    </section>
    <section className="workspace-panel profile-section section-spacing">
      <div className="profile-heading"><div><h2>Historial de partidos</h2><p>{data.games.length} registros · Desplázate para ver más columnas</p></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr>{['round','date','opponent','minutes','pts','reb','ast','stl','tov','valuation','ts_pct','usg_pct'].map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {data.games.map((row, index) => <tr key={String(row.game_id ?? index)}>{['round','date','opponent','minutes','pts','reb','ast','stl','tov','valuation','ts_pct','usg_pct'].map(column => <td key={column}>{displayValue(row[column])}</td>)}</tr>)}
      </tbody></table></div>
    </section>
  </>;
}
