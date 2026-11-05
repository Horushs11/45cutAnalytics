import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, subtitle, icon: Icon, accent = false }: StatCardProps) {
  return <div className={`stat-card${accent ? ' stat-card--accent' : ''}`}>
    <div className="stat-card__header"><span>{label}</span><div className="icon-tile"><Icon size={18} strokeWidth={1.8} /></div></div>
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__footer">{subtitle}</div>
  </div>;
}
