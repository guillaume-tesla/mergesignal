'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Beaker,
  Blocks,
  BotMessageSquare,
  ChevronDown,
  DatabaseZap,
  FileSearch,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Brand } from './brand';

const primary = [
  { href: '/app', label: 'Overview', icon: LayoutDashboard },
  { href: '/app/opportunities', label: 'Opportunities', icon: FileSearch },
  { href: '/app/experiments', label: 'Experiments', icon: Beaker },
  { href: '/app/ask', label: 'Ask', icon: BotMessageSquare },
];

const workspace = [
  { href: '/app/import', label: 'Import data', icon: DatabaseZap },
  { href: '/app/integrations', label: 'Integrations', icon: Blocks },
  { href: '/app/privacy', label: 'Privacy', icon: ShieldCheck },
];

function AppNav({ pathname, close }: { pathname: string; close: () => void }) {
  const link = ({ href, label, icon: Icon }: (typeof primary)[number]) => {
    const active = href === '/app' ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} key={href} className={active ? 'app-nav-link active' : 'app-nav-link'} aria-current={active ? 'page' : undefined} onClick={close}>
        <Icon size={17} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="app-nav-group">{primary.map(link)}</div>
      <p className="app-nav-label">Workspace</p>
      <div className="app-nav-group">{workspace.map(link)}</div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="product-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="product-sidebar">
        <div className="sidebar-brand"><Brand app /></div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">NC</div>
          <div><strong>Northstar Cloud</strong><span>72 engineers</span></div>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
        <nav className="app-navigation" aria-label="Application navigation">
          <AppNav pathname={pathname} close={() => setMobileOpen(false)} />
        </nav>
        <div className="sidebar-foot">
          <div className="demo-sidebar-badge"><Sparkles size={14} /><div><strong>Demo workspace</strong><span>Fictional data only</span></div></div>
          <Link href="/">Return to website <span aria-hidden="true">↗</span></Link>
        </div>
      </aside>

      <header className="mobile-app-header">
        <Brand app />
        <button type="button" aria-label="Open application navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
      </header>
      {mobileOpen && (
        <div className="mobile-nav-backdrop" role="presentation" onMouseDown={() => setMobileOpen(false)}>
          <aside className="mobile-nav-drawer" aria-label="Mobile application navigation" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mobile-nav-top"><Brand app /><button type="button" aria-label="Close application navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
            <nav className="app-navigation"><AppNav pathname={pathname} close={() => setMobileOpen(false)} /></nav>
          </aside>
        </div>
      )}

      <main className="product-main" id="main-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
