import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from 'lucide-react';
import './styles.css';

const imageAssets = import.meta.glob('./image/*.png', { eager: true, query: '?url', import: 'default' });
const logoImage = imageAssets['./image/logo.png'];
const groupImage = (group) => {
  const fileName = group === 'JP Laurel' ? 'J.P. Laurel' : group;
  return imageAssets[`./image/${fileName}.png`] || logoImage;
};
const accountPassword = (username, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(`tkvault-password-${username}`)) || fallback;
  } catch {
    return fallback;
  }
};
const readImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const today = new Date().toISOString().slice(0, 10);
const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date());

const groups = [
  { name: 'Buhangin', color: 'skyblue' },
  { name: 'Bunawan', color: 'lilac' },
  { name: 'Calinan', color: 'royal-blue' },
  { name: 'Indangan', color: 'orange' },
  { name: 'JP Laurel', color: 'violet' },
  { name: 'Mandug', color: 'emerald' },
  { name: 'Marilog', color: 'apricot' },
  { name: 'Mintal', color: 'brown' },
  { name: 'Panacan', color: 'navy-blue' },
  { name: 'Ponciano', color: 'mint' },
  { name: 'Samal', color: 'aqua-blue' },
  { name: 'Sandawa', color: 'pink' },
  { name: 'Toril', color: 'magenta' },
  { name: 'Mentors', color: 'gold' },
];

const loginAccounts = [
  { username: 'admin@tkvault.com', password: 'TKVaultAdmin2026!', role: 'administrator', name: 'Administrator' },
  ...groups.filter((group) => group.name !== 'Mentors').map((group) => ({
    username: `${group.name.toLowerCase().replace(' ', '')}@tkvault.com`,
    password: `${group.name.toLowerCase().replace(' ', '')}123`,
    role: 'group',
    group: group.name,
    name: `${group.name} Treasurer`,
  })),
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);

const typeClass = (type) => type.split(' ')[0].toLowerCase();

function Logo({ dark = false }) {
  return (
    <div className={`logo ${dark ? 'logo-dark' : ''}`}>
      <img className="logo-image" src={logoImage} alt="TKVault logo" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
      <span>TKVault</span>
    </div>
  );
}

function Avatar({ initials, color = 'blue', src }) {
  return src ? <img className="avatar avatar-image" src={src} alt="" onError={(event) => { event.currentTarget.src = logoImage; }} /> : <div className={`avatar avatar-${color}`}>{initials}</div>;
}

function SplashPage() {
  return <main className="splash-page"><img src={logoImage} alt="TKVault logo" /><h1>TKVault</h1><p>Every contribution, beautifully accounted for.</p></main>;
}

function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (isLoading) return;
    setError('');
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    const account = loginAccounts.find((item) => item.username.toLowerCase() === username.trim().toLowerCase() && accountPassword(item.username, item.password) === password);
    if (!account) {
      setError('Incorrect username or password.');
      return;
    }
    setIsLoading(true);
    window.setTimeout(() => {
      onLogin({ ...account, initials: account.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() });
    }, 700);
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Logo dark />
        <div className="visual-copy">
          <span className="eyebrow light">COLLECT WITH CONFIDENCE</span>
          <h1>Every contribution,<br /><em>beautifully</em> accounted for.</h1>
          <p>A clear, simple home for your group&apos;s collections and reports.</p>
          <div className="visual-stat"><ShieldCheck size={18} /><span>Trusted by community treasurers</span></div>
        </div>
        <div className="visual-orb orb-one" />
        <div className="visual-orb orb-two" />
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <span className="mobile-logo"><Logo /></span>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your vault</h2>
          <p className="muted">Manage your collections with clarity.</p>
          <form onSubmit={submit}>
            <label>Username or email<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="you@example.com" /></label>
            <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="form-error">{error}</div>}
            <button className="button button-primary button-full" type="submit" disabled={isLoading}>{isLoading ? <><LoaderCircle className="loading-spinner" size={17} /> Signing in...</> : <>Login <ArrowUpRight size={17} /></>}</button>
          </form>
          <p className="auth-footer">New to TKVault? <button className="text-button" onClick={onSignup}>Create an account</button></p>
        </div>
      </section>
    </main>
  );
}

function Signup({ onBack }) {
  const [name, setName] = useState('');
  return (
    <main className="auth-page">
      <section className="auth-visual signup-visual"><Logo dark /><div className="visual-copy"><span className="eyebrow light">A BETTER WAY TO KEEP UP</span><h1>Make every peso<br /><em>count.</em></h1><p>Start your group&apos;s secure collection space in minutes.</p></div><div className="visual-orb orb-one" /><div className="visual-orb orb-two" /></section>
      <section className="auth-form-wrap"><div className="auth-form"><span className="mobile-logo"><Logo /></span><span className="eyebrow">GET STARTED</span><h2>Create your account</h2><p className="muted">Set up your profile to start using TKVault.</p><div className="upload-avatar"><div className="upload-placeholder"><UserRound size={24} /></div><button className="text-button"><Upload size={14} /> Upload photo</button></div><label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" /></label><button className="button button-primary button-full" onClick={onBack}>Enter TKVault <ArrowUpRight size={17} /></button><p className="auth-footer">Already have an account? <button className="text-button" onClick={onBack}>Sign in</button></p></div></section>
    </main>
  );
}

function GroupPage({ onSelect, onLogout, account }) {
  return <main className="location-page"><div className="location-card"><div className="location-header"><Logo /><button className="location-logout" onClick={onLogout}><LogOut size={15} /> Sign out</button></div><div className="location-intro"><span className="eyebrow">ADMINISTRATOR ACCESS</span><h1>Which group are you managing?</h1><p>Select a group to open its private TKVault workspace.</p></div><div className="location-grid">{groups.map((group) => <button key={group.name} className={`location-button location-${group.color}`} onClick={() => onSelect(group.name)}><span className="location-dot" />{group.name}<ArrowUpRight size={16} /></button>)}</div><div className="location-footer"><ShieldCheck size={15} /> Signed in as {account.name}. Each group has separate data.</div></div></main>;
}

function Sidebar({ active, setActive, onLogout, group, onSettings, onSwitchGroup, isAdministrator, profileImage }) {
  const items = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: isAdministrator ? 'Admin Profile' : "Member's Profile", icon: UsersRound },
    { label: 'Collections', icon: WalletCards },
    { label: 'Liquidation Report', icon: FileSpreadsheet },
    ...(isAdministrator ? [{ label: 'Administrator Monitor', icon: ShieldCheck }] : []),
  ];
  return <aside className="sidebar"><div className="sidebar-top"><Logo dark /><button className="close-nav"><X size={18} /></button></div><nav><span className="nav-label">WORKSPACE</span>{items.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => setActive(label)}><Icon size={18} /><span>{label}</span>{label === 'Dashboard' && <span className="active-dot" />}</button>)}</nav><div className="sidebar-bottom">{isAdministrator && <button className="nav-item" onClick={onSwitchGroup}><UsersRound size={18} /><span>Switch group</span></button>}<button className={`nav-item ${active === 'Settings' ? 'active' : ''}`} onClick={onSettings}><Settings size={18} /><span>Settings</span></button><button className="profile-mini" onClick={onLogout}><Avatar initials={group.slice(0, 2).toUpperCase()} color="coral" src={profileImage} /><span><strong>{group}</strong><small>Sign out</small></span><LogOut size={16} /></button></div></aside>;
}

function Header({ onMenu, group, profileImage, onProfile }) {
  const isAdministrator = group === 'Administrator';
  return <header className="topbar"><button className="menu-button" onClick={onMenu}><Menu size={21} /></button><div className="breadcrumbs"><span>{group}</span><span>/</span><strong>Dashboard</strong></div><div className="topbar-actions"><button className="icon-button"><Search size={19} /></button><button className="profile" onClick={onProfile}><Avatar initials={isAdministrator ? 'AD' : group.slice(0, 2).toUpperCase()} color="coral" src={profileImage} /><span><strong>{isAdministrator ? 'Administrator' : group}</strong><small>{isAdministrator ? 'Admin profile' : 'Members'}</small></span><ChevronDown size={16} /></button></div></header>;
}

const positionOrder = { Provincial: 0, City: 1, Locale: 2, 'K&T': 3 };

function AdministratorProfile({ members }) {
  const sortedMembers = [...members].sort((a, b) => (positionOrder[a.position] ?? 99) - (positionOrder[b.position] ?? 99) || a.name.localeCompare(b.name));
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATOR ACCESS</span><h1>Admin Profile</h1><p>All registered members across every group, sorted by position.</p></div></div><section className="panel admin-profile-panel"><div className="panel-heading"><div><h2>Member directory</h2><p>{sortedMembers.length} registered members</p></div><div className="admin-profile-badge"><ShieldCheck size={15} /> Administrator</div></div><div className="admin-member-list">{sortedMembers.length ? sortedMembers.map((member) => <div className="admin-member-row" key={`${member.group}-${member.id}`}><Avatar initials={member.photo} src={member.photo?.startsWith('data:') ? member.photo : undefined} color={member.color} /><div className="collection-person"><strong>{member.name}</strong><span>{member.position}</span></div><span className="admin-member-group">{member.group}</span><span className={`type-pill position-${(member.position || '').toLowerCase().replace('&', 'and')}`}>{member.position}</span></div>) : <div className="empty-ledger">No members have been registered yet.</div>}</div></section></div>;
}

function AdministratorDashboard({ collections, groups }) {
  const totals = collections.reduce((acc, item) => { acc.overall += item.amount; if (item.type === 'Event Collection') acc.event += item.amount; if (item.type === 'Locale Collection') acc.locale += item.amount; if (item.type === 'Weekly Dues Collection') acc.dues += item.amount; return acc; }, { overall: 0, event: 0, locale: 0, dues: 0 });
  const groupTotals = groups.map((group) => ({ ...group, total: collections.filter((item) => item.group === group.name).reduce((sum, item) => sum + item.amount, 0) }));
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATOR DASHBOARD · {monthLabel.toUpperCase()}</span><h1>All groups overview</h1><p>Monitor collection performance across every TKVault group.</p></div></div><div className="stats-grid admin-stats-grid"><StatCard title="Total group collections" amount={totals.overall} icon={CircleDollarSign} tone="navy" change="All groups" /><StatCard title="Event collections" amount={totals.event} icon={Sparkles} tone="yellow" change="All groups" /><StatCard title="Locale collections" amount={totals.locale} icon={BarChart3} tone="blue" change="All groups" /><StatCard title="Weekly dues" amount={totals.dues} icon={CalendarDays} tone="orange" change="All groups" /></div><section className="panel admin-overview-panel"><div className="panel-heading"><div><h2>Collection overview</h2><p>Totals by group with each group&apos;s color accent</p></div><span className="admin-total-label">{formatCurrency(totals.overall)} total</span></div><div className="admin-group-grid">{groupTotals.map((group) => <article className={`admin-group-card location-${group.color}`} key={group.name}><div><span className="admin-group-dot" /><strong>{group.name}</strong></div><b>{formatCurrency(group.total)}</b><small>{collections.filter((item) => item.group === group.name).length} contributions</small></article>)}</div></section></div>;
}

function AdministratorMonitor({ collections }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const filteredCollections = collections.filter((collection) => {
    const searchable = `${collection.name} ${collection.position} ${collection.group}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (type === 'All types' || collection.type === type);
  });
  const total = filteredCollections.reduce((sum, collection) => sum + collection.amount, 0);
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATOR ACCESS</span><h1>Collections monitor</h1><p>Review contributions across every group in one place.</p></div></div><div className="collection-summary"><div><span>Contributions</span><strong>{filteredCollections.length}</strong></div><div><span>Total collected</span><strong>{formatCurrency(total)}</strong></div><div><span>Groups reporting</span><strong>{new Set(filteredCollections.map((item) => item.group)).size}</strong></div></div><section className="panel collections-panel"><div className="collection-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contributor or group" /></div><select className="select-button" value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option>Event Collection</option><option>Locale Collection</option><option>Weekly Dues Collection</option></select></div><div className="admin-monitor-head"><span /><span>Contributor</span><span>Group</span><span>Type</span><span>Amount</span><span>Date</span></div><div className="admin-monitor-list">{filteredCollections.length ? filteredCollections.map((collection) => <div className="admin-monitor-row" key={`${collection.group}-${collection.id}`}><Avatar initials={collection.photo} src={collection.photo?.startsWith('data:') ? collection.photo : undefined} color={collection.color} /><div className="collection-person"><strong>{collection.name}</strong><span>{collection.position}</span></div><strong className="monitor-group">{collection.group}</strong><span className={`type-pill ${typeClass(collection.type)}`}>{collection.type}</span><strong className="row-amount">{formatCurrency(collection.amount)}</strong><span className="row-date">{new Date(`${collection.date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>) : <div className="empty-ledger">No contributions match your filters.</div>}</div></section></div>;
}

function SettingsPage({ account, group, profileImage, onProfileChange, isAdministrator }) {
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState([]);
  const refreshRequests = () => {
    try { setRequests(JSON.parse(localStorage.getItem('tkvault-password-requests')) || []); } catch { setRequests([]); }
  };
  useEffect(() => { if (isAdministrator) refreshRequests(); }, [isAdministrator]);
  const uploadProfile = async (event) => {
    const file = event.target.files?.[0];
    if (file) { onProfileChange(await readImage(file)); setNotice('Profile picture updated.'); }
    event.target.value = '';
  };
  const requestPasswordChange = () => {
    if (password.length < 6) { setNotice('Use a password with at least 6 characters.'); return; }
    if (isAdministrator) {
      localStorage.setItem(`tkvault-password-${account.username}`, JSON.stringify(password));
      setPassword('');
      setNotice('Administrator password updated.');
      return;
    }
    const current = JSON.parse(localStorage.getItem('tkvault-password-requests') || '[]');
    localStorage.setItem('tkvault-password-requests', JSON.stringify([...current.filter((item) => item.username !== account.username), { username: account.username, group, password, status: 'pending' }]));
    setPassword('');
    setNotice('Request sent to the administrator for approval.');
    refreshRequests();
  };
  const decideRequest = (request, approved) => {
    if (approved) localStorage.setItem(`tkvault-password-${request.username}`, JSON.stringify(request.password));
    const next = requests.filter((item) => item.username !== request.username);
    localStorage.setItem('tkvault-password-requests', JSON.stringify(next));
    setRequests(next);
  };
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Settings</h1><p>Manage your profile and account access.</p></div></div><section className="panel settings-panel"><div className="settings-profile"><Avatar initials={group.slice(0, 2).toUpperCase()} src={profileImage} color="coral" /><div><h2>{account.name}</h2><p>{account.username}</p><label className="button button-quiet upload-label"><Upload size={15} /> Upload profile picture<input type="file" accept="image/*" onChange={uploadProfile} /></label></div></div><div className="settings-form"><h2>Change password</h2><p className="muted">{isAdministrator ? 'Administrator password changes take effect immediately.' : 'Requests are sent to the administrator for approval.'}</p><div className="settings-password-row"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" /><button className="button button-primary" onClick={requestPasswordChange}>{isAdministrator ? 'Save password' : 'Request change'}</button></div>{notice && <p className="settings-notice">{notice}</p>}</div>{isAdministrator && <div className="settings-requests"><h2>Password change requests</h2>{requests.length ? requests.map((request) => <div className="settings-request" key={request.username}><span><strong>{request.group}</strong><small>{request.username}</small></span><button className="button button-quiet" onClick={() => decideRequest(request, false)}>Deny</button><button className="button button-primary" onClick={() => decideRequest(request, true)}>Allow</button></div>) : <p className="muted">No pending requests.</p>}</div>}</section></div>;
}

function StatCard({ title, amount, icon: Icon, tone, change }) {
  return <article className={`stat-card ${tone}`}><div className="stat-top"><div className="stat-icon"><Icon size={20} /></div><span className="stat-change"><ArrowUpRight size={13} /> {change}</span></div><p>{title}</p><h3>{formatCurrency(amount)}</h3><span className="stat-caption">vs. previous month</span></article>;
}

function CollectionRow({ collection }) {
  return <div className="collection-row"><Avatar initials={collection.photo} src={collection.photo?.startsWith('data:') ? collection.photo : undefined} color={collection.color} /><div className="collection-person"><strong>{collection.name}</strong><span>{collection.position}</span></div><span className={`type-pill ${typeClass(collection.type)}`}>{collection.type}</span><strong className="row-amount">{formatCurrency(collection.amount)}</strong><span className="row-date">{new Date(`${collection.date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span><button className="row-more">•••</button></div>;
}

function Dashboard({ collections, onAdd, goal, onEditGoal, onViewAll }) {
  const [graphType, setGraphType] = useState('All collections');
  const graphCollections = graphType === 'All collections' ? collections : collections.filter((item) => item.type === graphType);
  const graphPath = graphType === 'Event Collection'
    ? 'M0 165 C80 150 105 105 170 130 S260 75 330 105 S430 60 500 88 S560 42 600 55'
    : graphType === 'Locale Collection'
      ? 'M0 145 C75 120 120 155 180 110 S275 125 335 72 S445 92 510 48 S570 65 600 28'
      : graphType === 'Weekly Dues Collection'
        ? 'M0 178 C70 170 120 145 180 155 S285 120 350 132 S445 98 510 105 S565 80 600 72'
        : 'M0 150 C50 135 62 120 100 125 S155 80 200 105 S260 128 300 85 S360 55 400 74 S445 55 500 35 S565 58 600 18';
  const totals = useMemo(() => collections.reduce((acc, item) => { acc.overall += item.amount; if (item.type === 'Event Collection') acc.event += item.amount; if (item.type === 'Locale Collection') acc.locale += item.amount; if (item.type === 'Weekly Dues Collection') acc.dues += item.amount; return acc; }, { overall: 0, event: 0, locale: 0, dues: 0 }), [collections]);
  const progress = Math.min(Math.round((totals.overall / goal) * 100), 100);
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">OVERVIEW · {monthLabel.toUpperCase()}</span><p>Here&apos;s what&apos;s happening with your collections.</p></div><button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add collection</button></div><div className="stats-grid"><StatCard title="Overall collections" amount={totals.overall} icon={CircleDollarSign} tone="navy" change="Tracked" /><StatCard title="Event collections" amount={totals.event} icon={Sparkles} tone="yellow" change="Tracked" /><StatCard title="Locale collections" amount={totals.locale} icon={BarChart3} tone="blue" change="Tracked" /><StatCard title="Weekly dues" amount={totals.dues} icon={CalendarDays} tone="orange" change="Tracked" /></div><div className="content-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Collection overview</h2>  <p>{graphType} · {graphCollections.length} records · {formatCurrency(graphCollections.reduce((sum, item) => sum + item.amount, 0))}</p></div><select className="select-button" value={graphType} onChange={(event) => setGraphType(event.target.value)}><option>All collections</option><option>Event Collection</option><option>Locale Collection</option><option>Weekly Dues Collection</option></select></div><div className="chart"><div className="chart-y"><span>₱60k</span><span>₱40k</span><span>₱20k</span><span>₱0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-label="Collection trend"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--group-accent)" stopOpacity=".28" /><stop offset="1" stopColor="var(--group-accent)" stopOpacity="0" /></linearGradient></defs><path d="M0 150 C50 135 62 120 100 125 S155 80 200 105 S260 128 300 85 S360 55 400 74 S445 55 500 35 S565 58 600 18 L600 200 L0 200Z" fill="url(#area)" /><path d="M0 150 C50 135 62 120 100 125 S155 80 200 105 S260 128 300 85 S360 55 400 74 S445 55 500 35 S565 58 600 18" fill="none" stroke="var(--group-accent)" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div></section><section className="panel goal-panel"><div className="panel-heading"><div><h2>Monthly goal</h2><p>{formatCurrency(goal)} target</p></div>  <button className="more-button" onClick={onEditGoal}>•••</button></div><div className="goal-ring" style={{ '--progress': `${progress * 3.6}deg` }}><div><strong>{progress}%</strong><span>achieved</span></div></div><div className="goal-numbers"><span><i className="dot dot-yellow" />Collected <strong>{formatCurrency(totals.overall)}</strong></span><span><i className="dot dot-light" />Goal <strong>{formatCurrency(goal)}</strong></span></div><div className="goal-message"><Sparkles size={15} /><span>{progress >= 75 ? 'You&apos;re on a great pace!' : 'Keep building your collection goal.'}</span></div></section></div><section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent collections</h2><p>Your latest recorded contributions</p></div><button className="text-button" onClick={onViewAll}>View all <ArrowUpRight size={15} /></button></div><div className="collection-list">{collections.slice(0, 5).map((item) => <CollectionRow key={item.id} collection={item} />)}</div></section></div>;
}

function CollectionsPage({ collections, onAdd }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const filteredCollections = collections.filter((collection) => {
    const matchesQuery = `${collection.name} ${collection.position}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === 'All types' || collection.type === type;
    return matchesQuery && matchesType;
  });
  const total = filteredCollections.reduce((sum, collection) => sum + collection.amount, 0);
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">TRANSACTION LEDGER</span><p>Review and manage every recorded contribution.</p></div><button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add collection</button></div><div className="collection-summary"><div><span>Showing</span><strong>{filteredCollections.length} records</strong></div><div><span>Filtered total</span><strong>{formatCurrency(total)}</strong></div><div><span>Last updated</span><strong>Today</strong></div></div><section className="panel collections-panel"><div className="collection-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by member or position" /></div><select className="select-button" value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option>Event Collection</option><option>Locale Collection</option><option>Weekly Dues Collection</option></select></div><div className="ledger-head"><span>Member</span><span>Type</span><span>Amount</span><span>Date</span><span /></div><div className="ledger-list">{filteredCollections.length ? filteredCollections.map((collection) => <CollectionRow key={collection.id} collection={collection} />) : <div className="empty-ledger">No collections match your filters.</div>}</div></section></div>;
}

function AddCollection({ members, onSubmit, onCancel }) {
  const firstMember = members[0];
  const [form, setForm] = useState({ memberId: firstMember?.id || '', amount: '', type: 'Event Collection', date: today });
  const selectedMember = members.find((member) => String(member.id) === String(form.memberId));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectMember = (memberId) => update('memberId', memberId);
  const submit = (e) => {
    e.preventDefault();
    if (!selectedMember || !form.amount) return;
    onSubmit({
      ...form,
      id: Date.now(),
      memberId: selectedMember.id,
      name: selectedMember.name,
      position: selectedMember.position,
      amount: Number(form.amount),
      photo: selectedMember.photo,
      color: selectedMember.color,
    });
  };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-heading"><div><span className="eyebrow">NEW ENTRY</span><h2>Add collection</h2><p>Select a member from Member&apos;s Profile and record their contribution.</p></div><button className="close-button" onClick={onCancel}><X size={19} /></button></div><form onSubmit={submit} className="modal-form"><label>Full name<select autoFocus value={form.memberId} onChange={(e) => selectMember(e.target.value)} disabled={!members.length}><option value="" disabled>{members.length ? 'Select a member' : 'Add member profile first'}</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><div className="form-row"><label>Position<input value={selectedMember?.position || ''} readOnly placeholder="Selected member position" /></label><label>Amount<input type="number" min="0" value={form.amount} onChange={(e) => update('amount', e.target.value)} placeholder="0.00" /></label></div><div className="form-row"><label>Collection type<select value={form.type} onChange={(e) => update('type', e.target.value)}><option>Event Collection</option><option>Locale Collection</option><option>Weekly Dues Collection</option></select></label><label>Date<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={!selectedMember}><Check size={16} /> Save collection</button></div></form></div></div>;
}

function EditGoal({ goal, onSubmit, onCancel }) {
  const [value, setValue] = useState(String(goal));
  const submit = (event) => {
    event.preventDefault();
    if (Number(value) > 0) onSubmit(Number(value));
  };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-heading"><div><span className="eyebrow">MONTHLY TARGET</span><h2>Edit monthly goal</h2><p>Set the collection target for this group.</p></div><button className="close-button" onClick={onCancel}><X size={19} /></button></div><form onSubmit={submit} className="modal-form"><label>Goal amount<input autoFocus type="number" min="1" value={value} onChange={(event) => setValue(event.target.value)} placeholder="100000" /></label><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} /> Save goal</button></div></form></div></div>;
}

function InformationPage({ members, collections, onAdd, onEdit, onDelete, readOnly = false }) {
  const [openMenu, setOpenMenu] = useState(null);
  const memberRows = members.map((member) => {
    const memberCollections = collections.filter((item) => item.name === member.name);
    const totals = memberCollections.reduce((sum, item) => {
      sum[item.type] += item.amount;
      return sum;
    }, { 'Event Collection': 0, 'Locale Collection': 0, 'Weekly Dues Collection': 0 });
    return { ...member, totals };
  });
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">MEMBER DIRECTORY</span><h1>Member&apos;s Profile</h1><p>{readOnly ? 'View all member information for this group.' : 'Manage members and view every contribution type.'}</p></div>{!readOnly && <button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add member profile</button>}</div><section className="panel members-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search members" /></div><button className="select-button">All positions <ChevronDown size={15} /></button></div><div className="member-grid">{memberRows.map((item) => <article className="member-card" key={item.id}><div className="member-card-header"><div className="member-cell"><Avatar initials={item.photo} src={item.photo?.startsWith('data:') ? item.photo : undefined} color={item.color} /><span><strong>{item.name}</strong><small>{item.position}</small></span></div>{!readOnly && <div className="member-actions"><button className="row-more" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} aria-label={`Actions for ${item.name}`}>•••</button>{openMenu === item.id && <div className="member-menu"><button onClick={() => { setOpenMenu(null); onEdit(item); }}>Edit</button><button className="danger-action" onClick={() => { setOpenMenu(null); onDelete(item); }}>Delete</button></div>}</div>}</div>{!readOnly && <div className="contribution-grid"><div><span>Event collection</span><strong>{item.totals['Event Collection'] ? formatCurrency(item.totals['Event Collection']) : '—'}</strong></div><div><span>Locale collection</span><strong>{item.totals['Locale Collection'] ? formatCurrency(item.totals['Locale Collection']) : '—'}</strong></div><div><span>Weekly dues</span><strong>{item.totals['Weekly Dues Collection'] ? formatCurrency(item.totals['Weekly Dues Collection']) : '—'}</strong>  </div></div>}</article>)}</div></section></div>;
}

function AddMember({ member, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: member?.name || '', position: member?.position || 'Provincial', photo: member?.photo || '' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const uploadPhoto = (event) => {
    const photo = event.target.files?.[0];
    if (!photo) return;
    const reader = new FileReader();
    reader.onload = () => update('photo', reader.result);
    reader.readAsDataURL(photo);
    event.target.value = '';
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.name) return;
    onSubmit({
      ...member,
      id: member?.id || Date.now(),
      name: form.name,
      position: form.position,
      photo: form.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      color: 'blue',
    });
  };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-heading"><div><span className="eyebrow">MEMBER DIRECTORY</span><h2>{member ? 'Edit member profile' : 'Add member profile'}</h2><p>{member ? 'Update this member profile.' : 'Create a member profile for your group.'}</p></div><button className="close-button" onClick={onCancel}><X size={19} /></button></div><form onSubmit={submit} className="modal-form"><div className="member-photo-upload">{form.photo?.startsWith('data:') ? <img className="upload-preview" src={form.photo} alt="Selected member" /> : <div className="upload-placeholder"><UserRound size={24} /></div>}<div><strong>Profile photo</strong><label className="text-button upload-label"><Upload size={14} /> Upload photo<input type="file" accept="image/*" onChange={uploadPhoto} /></label><small>Optional</small></div></div><label>Full name<input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Ana Reyes" /></label><label>Position<select value={form.position} onChange={(event) => update('position', event.target.value)}><option>Provincial</option><option>City</option><option>Locale</option><option>K&amp;T</option></select></label><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{member ? <Check size={16} /> : <Plus size={16} />} {member ? 'Save changes' : 'Add member'}</button></div></form></div></div>;
}

function LiquidationPage({ report, onReportChange, receipts, onReceiptChange }) {
  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const download = (file) => {
    if (!file?.dataUrl) return;
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    link.click();
  };
  const preview = (file) => {
    if (!file?.dataUrl) return <div className="file-preview-placeholder">Preview unavailable for this file.</div>;
    if (file.type?.startsWith('image/')) return <img className="file-preview-image" src={file.dataUrl} alt={`Preview of ${file.name}`} />;
    if (file.type === 'application/pdf') return <iframe className="file-preview-frame" src={file.dataUrl} title={`Preview of ${file.name}`} />;
    return <div className="file-preview-placeholder"><FileSpreadsheet size={18} /> {file.name} is ready to download.</div>;
  };
  const addReport = async (event) => {
    const file = event.target.files?.[0];
    if (file) onReportChange(await readFile(file));
    event.target.value = '';
  };
  const addReceipt = async (event) => {
    const file = event.target.files?.[0];
    if (file) onReceiptChange([await readFile(file), ...receipts]);
    event.target.value = '';
  };
  return <div className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">DOCUMENT CENTER</span><h1>Liquidation report</h1><p>Upload, preview and download your financial reports.</p></div></div><div className="report-layout"><section className="panel report-panel"><div className="report-icon"><FileSpreadsheet size={28} /></div><h2>Keep your reports in one place</h2><p className="muted">Upload an Excel or executable report file to make it available to your team.</p><label className="dropzone"><Upload size={22} /><strong>{report ? report.name : 'Choose a file or drag it here'}</strong><span>Supported files: .xlsx, .exe · Max 25 MB</span><input type="file" accept=".xlsx,.exe" onChange={addReport} /></label>{report && <><div className="uploaded-file"><FileSpreadsheet size={19} /><span><strong>{report.name}</strong><small>{(report.size / 1024).toFixed(1)} KB · Preview available</small></span><button className="icon-button" onClick={() => download(report)} aria-label={`Download ${report.name}`}><ArrowDownToLine size={17} /></button></div><div className="file-preview">{preview(report)}</div></>}</section><section className="panel receipts-panel"><div className="panel-heading"><div><h2>Receipts</h2><p>Upload and download supporting receipts.</p></div><div className="receipt-count">{receipts.length}</div></div><label className="receipt-upload"><Upload size={18} /><span><strong>Upload receipt</strong><small>PDF, JPG, PNG or Excel</small></span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.doc,.docx" onChange={addReceipt} /></label><div className="receipt-list">{receipts.length ? receipts.map((receipt, index) => <div className="receipt-item" key={`${receipt.name}-${index}`}><div className="receipt-file-icon"><FileSpreadsheet size={17} /></div><span><strong>{receipt.name}</strong><small>{(receipt.size / 1024).toFixed(1)} KB · Preview ready</small></span><button className="icon-button" onClick={() => download(receipt)} aria-label={`Download ${receipt.name}`}><ArrowDownToLine size={16} /></button></div>) : <div className="empty-receipts">No receipts uploaded yet.</div>}</div>{receipts[0] && <div className="file-preview">{preview(receipts[0])}</div>}</section></div></div>;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [auth, setAuth] = useState(false);
  const [signup, setSignup] = useState(false);
  const [account, setAccount] = useState(null);
  const [group, setGroup] = useState('');
  const [active, setActive] = useState('Dashboard');
  const [modal, setModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [members, setMembers] = useState([]);
  const [report, setReport] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [goal, setGoal] = useState(100000);
  const [profileImage, setProfileImage] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 10000);
    return () => window.clearTimeout(timer);
  }, []);
  const readGroupData = (key, selectedGroup, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(`tkvault-${key}-${selectedGroup}`)) || fallback;
    } catch {
      return fallback;
    }
  };
  useEffect(() => {
    if (!group) return;
    localStorage.setItem(`tkvault-collections-${group}`, JSON.stringify(collections));
  }, [collections, group]);
  useEffect(() => {
    if (!group) return;
    localStorage.setItem(`tkvault-members-${group}`, JSON.stringify(members));
  }, [members, group]);
  useEffect(() => {
    if (!group) return;
    localStorage.setItem(`tkvault-report-${group}`, JSON.stringify(report));
    localStorage.setItem(`tkvault-receipts-${group}`, JSON.stringify(receipts));
    localStorage.setItem(`tkvault-goal-${group}`, JSON.stringify(goal));
  }, [report, receipts, group]);
  useEffect(() => {
    if (!account) return;
    const saved = localStorage.getItem(`tkvault-profile-${account.username}`);
    setProfileImage(saved || (account.role === 'administrator' ? logoImage : (group ? groupImage(group) : logoImage)));
  }, [account, group]);
  const addCollection = (item) => { setCollections((current) => [item, ...current]); setModal(false); setActive('Dashboard'); };
  const addMember = (item) => { setMembers((current) => [item, ...current]); setModal(false); setActive("Member's Profile"); };
  const editMember = (item) => { setMembers((current) => current.map((member) => member.id === item.id ? item : member)); setCollections((current) => current.map((collection) => collection.memberId === item.id ? { ...collection, name: item.name, position: item.position, photo: item.photo, color: item.color } : collection)); setModal(false); };
  const deleteMember = (item) => {
    if (!window.confirm(`Delete ${item.name} and their recorded collections?`)) return;
    setMembers((current) => current.filter((member) => member.id !== item.id));
    setCollections((current) => current.filter((collection) => collection.memberId !== item.id && collection.name !== item.name));
  };
  const selectGroup = (selectedGroup) => {
    setGroup(selectedGroup);
    const demoNames = new Set(['Maya Santos', 'Rafael Cruz', 'Jasmine Lee', 'Andre Villanueva']);
    const storedCollections = readGroupData('collections', selectedGroup, []);
    const storedMembers = readGroupData('members', selectedGroup, []);
    const cleanCollections = storedCollections.filter((item) => !demoNames.has(item.name));
    const cleanMembers = storedMembers.filter((item) => !demoNames.has(item.name));
    setCollections(cleanCollections);
    setMembers(cleanMembers);
    setReport(readGroupData('report', selectedGroup, null));
    setReceipts(readGroupData('receipts', selectedGroup, []));
    setGoal(readGroupData('goal', selectedGroup, 100000));
  };
  const allGroupCollections = account?.role === 'administrator' ? groups.flatMap((item) => readGroupData('collections', item.name, []).map((collection) => ({ ...collection, group: item.name }))) : [];
  const allGroupMembers = account?.role === 'administrator' ? groups.flatMap((item) => readGroupData('members', item.name, []).map((member) => ({ ...member, group: item.name }))) : [];
  const handleLogin = (loggedInAccount) => {
    setAccount(loggedInAccount);
    setAuth(true);
    if (loggedInAccount.role === 'group') selectGroup(loggedInAccount.group);
    if (loggedInAccount.role === 'administrator') {
      selectGroup(groups[0].name);
      setActive('Dashboard');
    }
  };
  const logout = () => { setAuth(false); setAccount(null); setGroup(''); };
  if (showSplash) return <SplashPage />;
  if (!auth) return signup ? <Signup onBack={() => { setSignup(false); setAuth(true); }} /> : <Login onLogin={handleLogin} onSignup={() => setSignup(true)} />;
  if (!group) return <GroupPage account={account} onSelect={selectGroup} onLogout={logout} />;
  const isAdministrator = account.role === 'administrator';
  const groupTheme = isAdministrator ? 'royal-blue' : groups.find((item) => item.name === group)?.color || 'royal-blue';
  const updateProfile = (image) => { setProfileImage(image); localStorage.setItem(`tkvault-profile-${account.username}`, image); };
  return <div className={`app-shell group-theme-${groupTheme}`}><Sidebar group={isAdministrator ? 'Administrator' : group} profileImage={profileImage} isAdministrator={isAdministrator} onSwitchGroup={() => { setGroup(''); setActive('Dashboard'); setMenuOpen(false); }} active={active} setActive={(item) => { setActive(item); setMenuOpen(false); }} onSettings={() => { setActive('Settings'); setMenuOpen(false); }} onLogout={logout} /><div className={`mobile-overlay ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} /><main className="main-area"><Header group={isAdministrator ? 'Administrator' : group} profileImage={profileImage} onProfile={() => setActive(isAdministrator ? 'Admin Profile' : "Member's Profile")} onMenu={() => setMenuOpen(true)} />{active === 'Dashboard' && (isAdministrator ? <AdministratorDashboard collections={allGroupCollections} groups={groups} /> : <Dashboard collections={collections} goal={goal} onEditGoal={() => setModal('goal')} onViewAll={() => setActive('Collections')} onAdd={() => { setActive('Collections'); setModal('collection'); }} />)}{active === 'Admin Profile' && isAdministrator && <AdministratorProfile members={allGroupMembers} />}{active === "Member's Profile" && !isAdministrator && <InformationPage members={members} collections={collections} onAdd={() => setModal('member')} onEdit={(member) => setModal({ type: 'edit-member', member })} onDelete={deleteMember} />}{active === 'Collections' && <CollectionsPage collections={collections} onAdd={() => setModal('collection')} />}{active === 'Liquidation Report' && <LiquidationPage report={report} onReportChange={setReport} receipts={receipts} onReceiptChange={setReceipts} />}{active === 'Settings' && <SettingsPage account={account} group={group} profileImage={profileImage} onProfileChange={updateProfile} isAdministrator={isAdministrator} />}{active === 'Administrator Monitor' && isAdministrator && <AdministratorMonitor collections={allGroupCollections} />}</main>{modal === 'member' && <AddMember onSubmit={addMember} onCancel={() => setModal(false)} />}{modal?.type === 'edit-member' && <AddMember member={modal.member} onSubmit={editMember} onCancel={() => setModal(false)} />}  {modal === 'collection' && <AddCollection members={members} onSubmit={addCollection} onCancel={() => setModal(false)} />}{modal === 'goal' && <EditGoal goal={goal} onSubmit={(value) => { setGoal(value); setModal(false); }} onCancel={() => setModal(false)} />}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
