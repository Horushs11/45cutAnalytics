import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchField, SelectField } from '../../components/shared/FilterControls';
import { displayValue, getExplorerData, type AnalyticsRow } from '../../lib/analytics';
import { exportCsv } from '../../lib/export';

const views = [
  { value: 'player_season', label: 'Jugadores · temporada' },
  { value: 'player_game', label: 'Jugadores · partido' },
  { value: 'player_percentiles', label: 'Percentiles' },
  { value: 'player_radar_metrics', label: 'Radar · partido' },
  { value: 'player_45cut_score', label: '45CUT Score' },
  { value: 'team_season', label: 'Equipos · temporada' },
  { value: 'team_game', label: 'Equipos · partido' },
];
const limit = 50;

export function DataExplorerPage() {
  const [view, setView] = useState('player_season');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[] | null>(null);
  const [showColumns, setShowColumns] = useState(false);
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
  const { data, error, isFetching } = useQuery({
    queryKey: ['explorer', view, offset, search],
    queryFn: () => getExplorerData(view, offset, search, limit),
    placeholderData: previous => previous, staleTime: 60_000,
  });
  const columns = data?.view === view ? data.columns : [];
  const shownColumns = visibleColumns === null ? columns : columns.filter(item => visibleColumns.includes(item));
  const rows = useMemo(() => {
    if (!data || data.view !== view) return [];
    const list = [...data.rows];
    if (sort?.key) list.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const an = Number(av), bn = Number(bv);
      const comparison = av == null ? 1 : bv == null ? -1 : Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv), 'es');
      return sort.desc ? -comparison : comparison;
    });
    return list;
  }, [data, view, sort]);
  const changeView = (next: string) => { setView(next); setOffset(0); setSearch(''); setSearchInput(''); setVisibleColumns(null); setSort(null); };
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); setOffset(0); setSearch(searchInput); };
  const onExport = () => exportCsv(`45cut-${view}-page.csv`, rows.map(row => Object.fromEntries(shownColumns.map(column => [column, displayValue(row[column])])) as Record<string, string>));
  const toggleColumn = (column: string) => {
    const current = visibleColumns ?? columns;
    setVisibleColumns(current.includes(column) ? current.filter(item => item !== column) : [...current, column]);
  };
  const total = data?.view === view ? data.total : 0;
  return <>
    <PageHeader eyebrow="DATA INTELLIGENCE" title="Data Explorer" description="Consulta las siete vistas del esquema analytics, con todas sus columnas y paginación desde PostgreSQL."
      actions={<button className="button button--secondary" disabled={!rows.length || !shownColumns.length} onClick={onExport}><Download size={16}/> Exportar página CSV</button>}/>
    <section className="workspace-panel">
      <div className="workspace-panel__heading"><div><div className="title-with-icon"><Database size={20}/><h2>Explorador de datos</h2></div><p>{total.toLocaleString('es-ES')} registros en la vista seleccionada</p></div><span className="data-tag">ANALYTICS · 2026/27</span></div>
      <div className="filters-row">
        <SelectField value={view} onChange={changeView} label="Seleccionar vista" options={views}/>
        <form className="filter-search explorer-search" onSubmit={submitSearch}><SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar jugador, equipo o rival"/><button className="button button--secondary" type="submit">Buscar</button></form>
        <button className="button button--secondary" type="button" onClick={() => setShowColumns(!showColumns)}>Columnas ({shownColumns.length}/{columns.length})</button>
      </div>
      {showColumns && <div className="explorer-column-picker">
        <button className="text-link" onClick={() => setVisibleColumns(null)}>Mostrar todas</button>
        {columns.map(column => <label key={column}><input type="checkbox" checked={shownColumns.includes(column)} onChange={() => toggleColumn(column)}/>{column}</label>)}
      </div>}
      {error && <div className="profile-loading">{error instanceof Error ? error.message : 'Error al recuperar los datos.'}</div>}
      {isFetching && <div className="explorer-loading">Consultando PostgreSQL…</div>}
      <div className="table-scroll"><table className="data-table explorer-table"><thead><tr>{shownColumns.map(column => <th key={column}><button className="explorer-sort" onClick={() => setSort(prev => ({ key: column, desc: prev?.key === column ? !prev.desc : false }))}>{column} {sort?.key === column ? (sort.desc ? '↓' : '↑') : ''}</button></th>)}</tr></thead>
        <tbody>{rows.map((row: AnalyticsRow, index) => <tr key={index}>{shownColumns.map(column => <td key={column}>{column === 'player_name' && row.player_id != null
          ? <Link className="text-link" to={`/players/${row.player_id}`}>{displayValue(row[column])}</Link>
          : displayValue(row[column])}</td>)}</tr>)}</tbody></table></div>
      {!isFetching && !rows.length && !error && <p className="profile-loading">No hay registros para esta búsqueda.</p>}
      <div className="table-footer explorer-pagination"><span>{total ? `${offset + 1}–${Math.min(offset + limit, total)} de ${total}` : '0 resultados'} · Ordenación sobre la página actual</span>
        <div><button className="button button--secondary" disabled={offset === 0 || isFetching} onClick={() => setOffset(Math.max(0, offset - limit))}><ChevronLeft size={15}/> Anterior</button>
          <button className="button button--secondary" disabled={offset + limit >= total || isFetching} onClick={() => setOffset(offset + limit)}>Siguiente <ChevronRight size={15}/></button></div>
      </div>
    </section>
  </>;
}
