import type { ReactNode } from 'react';

interface PanelProps { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; }

export function Panel({ title, subtitle, action, children, className = '' }: PanelProps) {
  return <section className={`panel ${className}`}>
    <div className="panel__header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
    <div className="panel__body">{children}</div>
  </section>;
}
