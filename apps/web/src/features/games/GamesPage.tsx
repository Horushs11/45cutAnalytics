import { useMemo, useState } from 'react';
import { CalendarDays, CircleCheck, Clock3 } from 'lucide-react';
import { EmptyState } from '../../components/shared/EmptyState';
import { SearchField, SelectField } from '../../components/shared/FilterControls';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLeagueContext } from '../../hooks/useLeagueContext';
import { formatInt } from '../../lib/format';

export function GamesPage() {
  const { games } = useLeagueContext();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => games.filter(game =>
    `${game.homeTeam} ${game.awayTeam} ${game.round ?? ''}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === 'all' || status === game.status)), [games, search, status]);
  return <><PageHeader eyebrow="GAME INTELLIGENCE" title="Games & results" description="Consulta los enfrentamientos, jornadas y marcadores registrados en tu base de datos."/>
    <div className="workspace-panel">
      <div className="workspace-panel__heading"><div><div className="title-with-icon"><CalendarDays size={20}/><h2>Partidos de la temporada</h2></div><p>{filtered.length} partidos encontrados</p></div><span className="data-tag">GAME LOG</span></div>
      <div className="filters-row"><div className="filter-search"><SearchField value={search} onChange={setSearch} placeholder="Buscar equipo o jornada..."/></div>
        <SelectField value={status} onChange={setStatus} label="Estado del partido" options={[{value:'all',label:'Todos los partidos'},{value:'final',label:'Finalizados'},{value:'scheduled',label:'Pendientes'}]}/></div>
      <div className="table-scroll"><table className="data-table games-table"><thead><tr><th>Fecha</th><th>Jornada</th><th>Local</th><th className="numeric">Resultado</th><th>Visitante</th><th>Estado</th></tr></thead>
      <tbody>{filtered.map(game => <tr key={game.id}>
        <td className="muted-cell">{game.date ?? '—'}</td><td className="muted-cell">{game.round ?? '—'}</td><td><strong>{game.homeTeam}</strong></td>
        <td className="numeric game-result">{game.status === 'final' ? `${formatInt(game.homeScore)} : ${formatInt(game.awayScore)}` : '— : —'}</td>
        <td><strong>{game.awayTeam}</strong></td><td><span className={`status-pill status-pill--${game.status}`}>{game.status === 'final' ? <CircleCheck size={13}/> : <Clock3 size={13}/>} {game.status === 'final' ? 'Finalizado' : 'Pendiente'}</span></td>
      </tr>)}</tbody></table></div>
      {!filtered.length && <EmptyState/>}
      <div className="table-footer"><span>Partidos disponibles en la tabla games.</span><span>{filtered.length} filas</span></div>
    </div>
  </>;
}
