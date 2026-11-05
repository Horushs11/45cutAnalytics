import { useMemo, useState } from 'react';
import { Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/shared/Avatar';
import { EmptyState } from '../../components/shared/EmptyState';
import { SearchField, SelectField } from '../../components/shared/FilterControls';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLeagueContext } from '../../hooks/useLeagueContext';
import { exportCsv } from '../../lib/export';
import { formatInt, formatNumber, formatPercent } from '../../lib/format';
import type { PlayerStats } from '@45cut/shared';

type SortKey = 'pointsPerGame' | 'reboundsPerGame' | 'assistsPerGame' | 'trueShootingPct' | 'effectiveFieldGoalPct' | 'minutes';
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'pointsPerGame', label: 'Puntos / partido' }, { value: 'reboundsPerGame', label: 'Rebotes / partido' },
  { value: 'assistsPerGame', label: 'Asistencias / partido' }, { value: 'trueShootingPct', label: 'True Shooting %' },
  { value: 'effectiveFieldGoalPct', label: 'eFG %' }, { value: 'minutes', label: 'Minutos' },
];

export function PlayersPage() {
  const { players, season } = useLeagueContext();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('all');
  const [sort, setSort] = useState<SortKey>('pointsPerGame');
  const [minimumGames, setMinimumGames] = useState('0');
  const teamOptions = useMemo(() => [...new Set(players.map(player => player.teamName).filter(Boolean))].sort(), [players]);
  const filtered = useMemo(() => players.filter(player =>
    (team === 'all' || player.teamName === team) && player.games >= Number(minimumGames) &&
    `${player.name} ${player.teamName}`.toLowerCase().includes(search.trim().toLowerCase()),
  ).sort((a, b) => (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity) || a.name.localeCompare(b.name)), [players, team, search, minimumGames, sort]);

  const onExport = () => exportCsv('45cut-players.csv', filtered.map((player: PlayerStats) => ({
    Player: player.name, Team: player.teamName, GP: player.games, MPG: player.minutes,
    PPG: player.pointsPerGame, RPG: player.reboundsPerGame, APG: player.assistsPerGame,
    'FG%': player.fieldGoalPct, 'eFG%': player.effectiveFieldGoalPct, 'TS%': player.trueShootingPct, 'USG%': player.usagePct,
  })));

  return <>
    <PageHeader eyebrow="PLAYER INTELLIGENCE" title="Player explorer" description={`Busca, filtra y compara el rendimiento individual durante la temporada ${season}.`}
      actions={<button type="button" className="button button--secondary" onClick={onExport} disabled={!filtered.length}><Download size={16}/> Exportar CSV</button>}/>
    <div className="workspace-panel">
      <div className="workspace-panel__heading"><div><div className="title-with-icon"><Users size={20}/><h2>Base de jugadores</h2></div><p>{formatInt(filtered.length)} resultados de {formatInt(players.length)} jugadores · Pulsa un nombre para abrir su perfil</p></div><span className="data-tag">SEASON {season}</span></div>
      <div className="filters-row">
        <div className="filter-search"><SearchField value={search} onChange={setSearch} placeholder="Buscar jugador o equipo..."/></div>
        <SelectField label="Filtrar equipo" value={team} onChange={setTeam} options={[{value:'all',label:'Todos los equipos'},...teamOptions.map(name => ({value:name,label:name}))]}/>
        <SelectField label="Ordenar por" value={sort} onChange={value => setSort(value as SortKey)} options={sortOptions}/>
        <SelectField label="Mínimo de partidos" value={minimumGames} onChange={setMinimumGames} options={[{value:'0',label:'Todos los partidos'}, {value:'3',label:'3+ partidos'}, {value:'5',label:'5+ partidos'}, {value:'10',label:'10+ partidos'}]}/>
      </div>
      <div className="table-scroll"><table className="data-table"><thead><tr>
        <th className="col-rank">#</th><th>Jugador</th><th>Equipo</th><th className="numeric">PJ</th><th className="numeric">MIN</th><th className="numeric">PTS</th><th className="numeric">REB</th><th className="numeric">AST</th><th className="numeric">eFG%</th><th className="numeric">TS%</th><th className="numeric">USG%</th>
      </tr></thead><tbody>{filtered.map((player, index) => <tr key={`${player.id}-${player.teamId}`}>
        <td className="col-rank">{String(index + 1).padStart(2, '0')}</td>
        <td><Link className="table-person text-link" to={`/players/${player.id}`}><Avatar name={player.name} small/><strong>{player.name}</strong></Link></td>
        <td className="muted-cell">{player.teamName || '—'}</td><td className="numeric">{formatInt(player.games)}</td>
        <td className="numeric">{formatNumber(player.minutes)}</td><td className="numeric high-cell">{formatNumber(player.pointsPerGame)}</td>
        <td className="numeric">{formatNumber(player.reboundsPerGame)}</td><td className="numeric">{formatNumber(player.assistsPerGame)}</td>
        <td className="numeric">{formatPercent(player.effectiveFieldGoalPct)}</td><td className="numeric">{formatPercent(player.trueShootingPct)}</td>
        <td className="numeric">{formatPercent(player.usagePct)}</td>
      </tr>)}</tbody></table></div>
      {!filtered.length && <EmptyState/>}
      <div className="table-footer"><span>PPG, RPG, APG y minutos son promedios por partido · Datos disponibles</span><span>{filtered.length} filas</span></div>
    </div>
  </>;
}
