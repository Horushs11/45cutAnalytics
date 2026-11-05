import { useMemo, useState } from 'react';
import { Download, Shield } from 'lucide-react';
import { RatingChart } from '../../components/charts/RatingChart';
import { EmptyState } from '../../components/shared/EmptyState';
import { SearchField, SelectField } from '../../components/shared/FilterControls';
import { PageHeader } from '../../components/shared/PageHeader';
import { Panel } from '../../components/shared/Panel';
import { useLeagueContext } from '../../hooks/useLeagueContext';
import { exportCsv } from '../../lib/export';
import { formatInt, formatNumber, formatPercent, formatSigned, toneForValue } from '../../lib/format';
import type { TeamStats } from '@45cut/shared';

type SortKey = 'netRating' | 'offensiveRating' | 'defensiveRating' | 'wins' | 'effectiveFieldGoalPct' | 'offensiveReboundPct';
const sorts: {value: SortKey; label: string}[] = [
  {value: 'netRating', label: 'Net Rating'}, {value: 'wins',label: 'Victorias'},
  {value: 'offensiveRating',label:'Offensive Rating'}, {value: 'defensiveRating',label: 'Defensive Rating (menor mejor)'},
  {value: 'effectiveFieldGoalPct',label: 'eFG%'}, {value: 'offensiveReboundPct',label: 'REB ofensivo %'},
];

export function TeamsPage() {
  const { teams } = useLeagueContext();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('netRating');
  const filtered = useMemo(() => teams.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort === 'defensiveRating' ? (a[sort] ?? Infinity) - (b[sort] ?? Infinity) : (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity)), [teams,search,sort]);
  const onExport = () => exportCsv('45cut-teams.csv', filtered.map((team: TeamStats) => ({
    Team: team.name, GP: team.games, Wins: team.wins, Losses: team.losses,
    ORtg: team.offensiveRating, DRtg: team.defensiveRating, NetRtg: team.netRating,
    PPG: team.pointsPerGame, OppPPG: team.allowedPointsPerGame,
    'eFG%': team.effectiveFieldGoalPct, 'ORB%': team.offensiveReboundPct,
  })));

  return <><PageHeader eyebrow="TEAM INTELLIGENCE" title="Team performance" description="Visión general de eficiencia ofensiva, defensiva y métricas avanzadas por equipo."
    actions={<button type="button" className="button button--secondary" onClick={onExport} disabled={!filtered.length}><Download size={16}/> Exportar CSV</button>}/>
    <Panel title="Mapa de eficiencia" subtitle="Offensive Rating y Defensive Rating de los equipos disponibles"><RatingChart teams={filtered}/></Panel>
    <div className="workspace-panel section-spacing">
      <div className="workspace-panel__heading"><div><div className="title-with-icon"><Shield size={20}/><h2>Clasificación estadística</h2></div><p>{filtered.length} equipos encontrados</p></div><span className="data-tag">TEAM METRICS</span></div>
      <div className="filters-row"><div className="filter-search"><SearchField value={search} onChange={setSearch} placeholder="Buscar equipo..."/></div>
        <SelectField label="Ordenar equipos" value={sort} onChange={val => setSort(val as SortKey)} options={sorts}/></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>#</th><th>Equipo</th><th className="numeric">PJ</th><th className="numeric">V</th><th className="numeric">D</th><th className="numeric">PTS</th><th className="numeric">OPP PTS</th><th className="numeric">ORtg</th><th className="numeric">DRtg</th><th className="numeric">NetRtg</th><th className="numeric">eFG%</th><th className="numeric">ORB%</th></tr></thead>
      <tbody>{filtered.map((team, index) => <tr key={team.id}><td className="col-rank">{String(index + 1).padStart(2, '0')}</td><td><strong className="team-cell"><span className="team-monogram">{team.name.slice(0,2).toUpperCase()}</span>{team.name}</strong></td>
        <td className="numeric">{formatInt(team.games)}</td><td className="numeric">{formatInt(team.wins)}</td><td className="numeric">{formatInt(team.losses)}</td>
        <td className="numeric">{formatNumber(team.pointsPerGame)}</td><td className="numeric">{formatNumber(team.allowedPointsPerGame)}</td>
        <td className="numeric">{formatNumber(team.offensiveRating)}</td><td className="numeric">{formatNumber(team.defensiveRating)}</td>
        <td className="numeric"><span className={`metric-chip metric-chip--${toneForValue(team.netRating)}`}>{formatSigned(team.netRating)}</span></td>
        <td className="numeric">{formatPercent(team.effectiveFieldGoalPct)}</td><td className="numeric">{formatPercent(team.offensiveReboundPct)}</td>
      </tr>)}</tbody></table></div>
      {!filtered.length && <EmptyState/>}
      <div className="table-footer"><span>ORtg alto y DRtg bajo indican mayor eficiencia; comparar con atención al contexto.</span><span>{filtered.length} filas</span></div>
    </div>
  </>;
}
