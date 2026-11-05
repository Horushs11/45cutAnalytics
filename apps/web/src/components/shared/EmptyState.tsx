import { DatabaseZap } from 'lucide-react';

export function EmptyState({ title = 'No hay resultados', detail = 'Prueba con otros filtros.' }: { title?: string; detail?: string }) {
  return <div className="empty-state"><DatabaseZap size={24} /><strong>{title}</strong><p>{detail}</p></div>;
}
