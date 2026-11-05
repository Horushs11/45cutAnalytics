import { CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';
import type { TeamStats } from '@45cut/shared';

export function RatingChart({ teams }: { teams: TeamStats[] }) {
  const chartData = teams.filter(team => team.offensiveRating != null && team.defensiveRating != null)
    .slice(0, 9).map(team => ({ name: team.name, offense: team.offensiveRating, defense: team.defensiveRating }));
  if (!chartData.length) return <div className="chart-empty">No hay datos de rating disponibles en la base de datos.</div>;
  return <div className="chart-container"><ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} margin={{ top: 16, right: 4, left: -25, bottom: 13 }} barGap={3}>
      <CartesianGrid vertical={false} stroke="#26313e" strokeDasharray="3 5" />
      <XAxis dataKey="name" stroke="#78879a" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-24} height={52}/>
      <YAxis stroke="#78879a" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
      <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} contentStyle={{ background: '#131c28', border: '1px solid #2a3747', borderRadius: 10, color: '#f3f7fa' }} formatter={(value) => [Number(value).toFixed(1), '']} />
      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#98a5b4' }} />
      <Bar name="Offensive Rating" dataKey="offense" fill="#f2a74b" radius={[3, 3, 0, 0]} maxBarSize={18} />
      <Bar name="Defensive Rating" dataKey="defense" fill="#597ea6" radius={[3, 3, 0, 0]} maxBarSize={18} />
    </BarChart>
  </ResponsiveContainer></div>;
}
