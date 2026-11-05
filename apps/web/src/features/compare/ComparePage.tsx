import { useMemo, useState } from 'react';
import { GitCompareArrows, MoveRight } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SelectField } from '../../components/shared/FilterControls';
import { EmptyState } from '../../components/shared/EmptyState';
import { useLeagueContext } from '../../hooks/useLeagueContext';
import { formatNumber, formatPercent, formatSigned } from '../../lib/format';
import type { TeamStats } from '@45cut/shared';

type Metric = { title: string; key: keyof Pick<TeamStats, 'offensiveRating'|'defensiveRating'|'netRating'|'pointsPerGame'|'effectiveFieldGoalPct'|'offensiveReboundPct'>; suffix?: string; lowerIsBetter?: boolean };
const metrics: Metric[] = [
  {title:'Offensive Rating',key:'offensiveRating'}, {title:'Defensive Rating',key:'defensiveRating',lowerIsBetter:true},
  {title:'Net Rating',key:'netRating'}, {title:'Puntos por partido',key:'pointsPerGame'},
  {title:'eFG%',key:'effectiveFieldGoalPct',suffix:'%'}, {title:'Rebote ofensivo',key:'offensiveReboundPct',suffix:'%'},
];

export function ComparePage() {
  const { teams } = useLeagueContext();
  const [firstId, setFirstId] = useState('');
  const [secondId, setSecondId] = useState('');
  const first = teams.find(team => team.id === (firstId || teams[0]?.id));
  const second = teams.find(team => team.id === (secondId || teams[1]?.id));
  const options = useMemo(() => teams.map(team => ({value:team.id,label:team.name})), [teams]);

  return <><PageHeader eyebrow="PERFORMANCE LAB" title="Team comparison" description="Contrasta estadísticas clave de dos equipos para encontrar fortalezas y debilidades."/>
    {teams.length < 2 ? <div className="workspace-panel"><EmptyState title="Necesitas al menos dos equipos" detail="Carga datos de equipos en PostgreSQL para activar el comparador."/></div> : <>
      <div className="comparison-selector"><div className="comparison-team"><span>EQUIPO A</span><SelectField label="Primer equipo" value={first?.id ?? ''} onChange={setFirstId} options={options}/></div>
        <div className="versus">VS<MoveRight size={15}/></div>
        <div className="comparison-team"><span>EQUIPO B</span><SelectField label="Segundo equipo" value={second?.id ?? ''} onChange={setSecondId} options={options}/></div></div>
      <div className="workspace-panel comparison-board">
        <div className="workspace-panel__heading"><div><div className="title-with-icon"><GitCompareArrows size={20}/><h2>Face to face</h2></div><p>Comparación directa de métricas</p></div><span className="data-tag">HEAD TO HEAD</span></div>
        {first?.id === second?.id && <p className="comparison-warning">Selecciona dos equipos distintos para comparar sus estadísticas.</p>}
        <div className="comparison-header"><strong>{first?.name}</strong><span>INDICADOR</span><strong>{second?.name}</strong></div>
        <div className="comparison-metrics">{metrics.map(metric => {
          const left = first?.[metric.key] ?? null;
          const right = second?.[metric.key] ?? null;
          const maximum = Math.max(Math.abs(left ?? 0), Math.abs(right ?? 0), 1);
          const leftBetter = left !== null && right !== null && (metric.lowerIsBetter ? left < right : left > right);
          const rightBetter = left !== null && right !== null && (metric.lowerIsBetter ? right < left : right > left);
          const format = metric.suffix === '%' ? formatPercent : metric.key === 'netRating' ? formatSigned : formatNumber;
          return <div className="compare-metric" key={metric.key}>
            <div className="comparison-values"><strong className={leftBetter ? 'winner' : ''}>{format(left)}</strong><span>{metric.title}</span><strong className={rightBetter ? 'winner' : ''}>{format(right)}</strong></div>
            <div className="comparison-bars"><div className="comparison-bars__left"><div style={{width:`${Math.abs(left ?? 0)/maximum * 100}%`}}/></div><div className="comparison-bars__right"><div style={{width:`${Math.abs(right ?? 0)/maximum * 100}%`}}/></div></div>
          </div>;
        })}</div>
        <div className="comparison-footnote">Un valor mayor no siempre es mejor: en DRtg gana el valor menor. Las barras representan magnitud absoluta.</div>
      </div>
    </>}
  </>;
}
