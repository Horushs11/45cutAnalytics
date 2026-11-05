import { useState } from 'react';
import { Activity, ArrowUpRight, CircleHelp, Database, GitCompareArrows, Github, LayoutDashboard, Menu, Shield, Trophy, Users, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { LeagueData } from '@45cut/shared';
import { DataNotice } from '../shared/DataNotice';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/players', label: 'Jugadores', icon: Users },
  { to: '/explorer', label: 'Data Explorer', icon: Database },
  { to: '/teams', label: 'Equipos', icon: Shield },
  { to: '/games', label: 'Partidos', icon: Trophy },
  { to: '/compare', label: 'Comparador', icon: GitCompareArrows },
];

const titles: Record<string, string> = {
  '/': 'Dashboard', '/players': 'Jugadores', '/explorer': 'Data Explorer', '/teams': 'Equipos', '/games': 'Partidos', '/compare': 'Comparador',
};

export function AppShell({ data }: { data: LeagueData }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <div className="app-layout">
    {open && <button type="button" className="mobile-overlay" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="brand"><div className="brand__logo">45<span>°</span></div><div className="brand__text"><strong>45CUT</strong><span>ANALYTICS</span></div>
        <button className="icon-button mobile-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}><X size={18}/></button>
      </div>
      <div className="sidebar__section-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Navegación principal">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `side-nav__item ${isActive ? 'side-nav__item--active' : ''}`}>
          <Icon size={19} strokeWidth={1.9}/><span>{label}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar__grow" />
      <div className="sidebar__section-label">PROYECTO</div>
      <div className="sidebar__details"><Activity size={16}/><span>Primera FEB</span><small>{data.season}</small></div>
      <div className="sidebar__footer"><div className="sidebar__avatar">45</div><div><strong>Local workspace</strong><span>Personal analytics</span></div><CircleHelp size={16} className="sidebar__help"/></div>
    </aside>
    <div className="main-shell">
      <div className="topbar">
        <div className="topbar__left"><button type="button" className="icon-button menu-button" aria-label="Abrir menú" onClick={() => setOpen(true)}><Menu size={20}/></button><span className="topbar__workspace">WORKSPACE</span><span className="topbar__separator">/</span><span>{titles[location.pathname] ?? (location.pathname.startsWith('/players/') ? 'Perfil de jugador' : location.pathname.startsWith('/teams/') ? 'Perfil de equipo' : '45CUT Analytics')}</span></div>
        <div className="topbar__right"><span className="local-pill"><span className="online-dot" />LOCAL</span><a href="https://github.com/Horushs11/45cutAnalytics" target="_blank" rel="noreferrer" className="icon-button" aria-label="Abrir GitHub"><Github size={19}/></a></div>
      </div>
      <main className="content"><DataNotice data={data}/><Outlet context={data}/>
        <footer className="main-footer"><span>© 2026 45CUT Analytics · Local first</span><span>Designed for data exploration <ArrowUpRight size={13}/></span></footer>
      </main>
    </div>
  </div>;
}
