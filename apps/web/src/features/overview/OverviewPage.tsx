import { Activity, ArrowRight, CalendarDays, Crosshair, Shield, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RatingChart } from '../../components/charts/RatingChart';
import { Avatar } from '../../components/shared/Avatar';
import { Panel } from '../../components/shared/Panel';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { useLeagueContext } from '../../hooks/useLeagueContext';
import { formatInt, formatNumber, formatSigned, toneForValue } from '../../lib/format';

export function OverviewPage() {
  const { teams, players, games, season } = useLeagueContext();
  const scored = games.filter(game => game.status === 'final');
  const highestRated = [...teams].filter(team => team.netRating !== null).sort((a,b) => (b.netRating ?? -Infinity) - (a.netRating ?? -Infinity));
  const leadingScorers = [...players].sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 5);
  const lastGames = [...scored].sort((a,b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 4);
  const averagePoints = scored.length ? scored.reduce((sum, game) => sum + (game.homeScore ?? 0) + (game.awayScore ?? 0), 0) / (scored.length * 2) : null;

  return <>
    <PageHeader eyebrow="BASKETBALL INTELLIGENCE" title="League overview" description={`Un espacio para explorar estadísticas, tendencias y rendimiento de Primera FEB · ${season}`}
      actions={<span className="season-pill"><CalendarDays size={15}/>{season}</span>} />
    <div className="stats-grid">
      <StatCard label="Equipos" value={formatInt(teams.length)} subtitle="Equipos registrados" icon={Shield} accent />
      <StatCard label="Jugadores" value={formatInt(players.length)} subtitle="Perfiles disponibles" icon={Users} />
      <StatCard label="Partidos" value={formatInt(scored.length)} subtitle={`${games.length} en base de datos`} icon={Trophy} />
      <StatCard label="Media de puntos" value={formatNumber(averagePoints)} subtitle="Por equipo y partido" icon={Crosshair} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Rendimiento de equipos" subtitle="Comparativa ORtg vs DRtg · Un DRtg más bajo es mejor" className="panel--chart" action={<Link className="text-link" to="/teams">Ver equipos <ArrowRight size={15}/></Link>}>
        <RatingChart teams={teams}/>
      </Panel>
      <Panel title="Top anotadores" subtitle="Puntos por partido" action={<Link className="text-link" to="/players">Todos <ArrowRight size={15}/></Link>}>
        <div className="leader-list">{leadingScorers.map((player, i) => <div className="leader-row" key={`${player.id}-${player.teamId}`}>
          <span className="rank-index">{String(i + 1).padStart(2,'0')}</span><Avatar name={player.name} small/>
          <div className="leader-row__name"><strong>{player.name}</strong><small>{player.teamName || 'Sin equipo'}</small></div>
          <strong className="leader-row__value">{formatNumber(player.pointsPerGame)} <small>PPG</small></strong>
        </div>)}</div>
        {!leadingScorers.length && <div className="chart-empty">Sin estadísticas de jugadores.</div>}
      </Panel>
    </div>
    <div className="dashboard-grid dashboard-grid--bottom">
      <Panel title="Power ranking" subtitle="Ordenado por Net Rating" action={<Link className="text-link" to="/compare">Comparar <ArrowRight size={15}/></Link>}>
        <div className="ranking-list">{highestRated.slice(0, 5).map((team, i) => <div className="ranking-row" key={team.id}>
          <span className="rank-index">{String(i + 1).padStart(2,'0')}</span><span className="ranking-row__name">{team.name}</span>
          <span className={`metric-chip metric-chip--${toneForValue(team.netRating)}`}>{formatSigned(team.netRating)}</span>
        </div>)}</div>
        {!highestRated.length && <div className="chart-empty">Sin Net Rating calculado.</div>}
      </Panel>
      <Panel title="Últimos resultados" subtitle="Partidos más recientes" action={<Link className="text-link" to="/games">Ver calendario <ArrowRight size={15}/></Link>}>
        <div className="game-summary">{lastGames.map(game => <div className="game-summary__row" key={game.id}>
          <div><span>{game.homeTeam}</span><small>vs {game.awayTeam}</small></div>
          <strong>{formatInt(game.homeScore)} <span className="result-dash">–</span> {formatInt(game.awayScore)}</strong>
        </div>)}</div>
        {!lastGames.length && <div className="chart-empty">No hay partidos con resultado.</div>}
      </Panel>
    </div>
    <div className="footer-note"><Activity size={16}/><span>Los rankings se calculan con los datos disponibles. Comprueba muestras y calendario antes de extraer conclusiones.</span></div>
  </>;
}
