import { AlertCircle, FlaskConical, CheckCircle2 } from 'lucide-react';
import type { LeagueData } from '@45cut/shared';

export function DataNotice({ data }: { data: LeagueData }) {
  return <div className={`data-notice ${data.source === 'demo' ? 'data-notice--demo' : ''}`}>
    {data.source === 'demo' ? <FlaskConical size={17} /> : <CheckCircle2 size={17} />}
    <div><strong>{data.source === 'demo' ? 'Modo demostración' : 'Base de datos conectada'}</strong>
      <span>{data.source === 'demo'
        ? 'Los números mostrados son ilustrativos, no estadísticas oficiales. Configura PostgreSQL para cargar tus datos.'
        : `Estadísticas leídas de PostgreSQL local · ${data.season}`}</span></div>
    {data.warnings.length > 0 && data.source !== 'demo' && <details className="warnings"><summary><AlertCircle size={14}/> {data.warnings.length} avisos</summary>
      <ul>{data.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details>}
  </div>;
}
